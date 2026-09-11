/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { computed, provide, ref, watch } from 'vue';
import * as Misskey from 'misskey-js';
import { isLink } from '@@/js/is-link.js';
import { shouldCollapsed, shouldMfmCollapsed } from '@@/js/collapsed.js';
import { concat } from '@@/js/array.js';
import { host } from '@@/js/config.js';
import { toUnicode } from 'punycode.js';
import type { Ref, ShallowRef } from 'vue';
import type { OpenOnRemoteOptions } from '@/utility/please-login.js';
import type { TranslateStatus } from '@/utility/translate.js';
import { pleaseLogin } from '@/utility/please-login.js';
import { checkWordMute } from '@/utility/check-word-mute.js';
import { misskeyApi, misskeyApiGet } from '@/utility/misskey-api.js';
import * as os from '@/os.js';
import * as sound from '@/utility/sound.js';
import { reactionPicker } from '@/utility/reaction-picker.js';
import { extractUrlFromMfm } from '@/utility/extract-url-from-mfm.js';
import { getNoteClipMenu, getNoteMenu, getRenoteMenu, getRenoteOnly, getQuoteMenu } from '@/utility/get-note-menu.js';
import { noteEvents, useNoteCapture } from '@/composables/use-note-capture.js';
import { deepClone } from '@/utility/clone.js';
import { useTooltip } from '@/composables/use-tooltip.js';
import { claimAchievement } from '@/utility/achievements.js';
import { showMovedDialog } from '@/utility/show-moved-dialog.js';
import { getAppearNote } from '@/utility/get-appear-note.js';
import { prefer } from '@/preferences.js';
import { getPluginHandlers } from '@/plugin.js';
import { $i } from '@/i.js';
import { i18n } from '@/i18n.js';
import { instance } from '@/instance.js';
import { useGlobalEvent } from '@/events.js';
import { useRouter } from '@/router.js';
import { miLocalStorage } from '@/local-storage.js';
import { haptic } from '@/utility/haptic.js';
import detectLanguage from '@/utility/detect-language.js';
import { parseMfmCached } from '@/utility/mfm-cache.js';
import { notesReactionsCreate } from '@/utility/check-reaction-create';
import { notePage } from '@/filters/note.js';
import MkUsersTooltip from '@/components/MkUsersTooltip.vue';
import MkReactionsViewerDetails from '@/components/MkReactionsViewer.details.vue';
import MkRippleEffect from '@/components/MkRippleEffect.vue';
import { DI } from '@/di.js';

export interface UseNoteProps {
	note: Misskey.entities.Note;
	pinned?: boolean;
	mock?: boolean;
	withHardMute?: boolean;
}

export interface UseNoteElements {
	rootEl?: ShallowRef<HTMLElement | null>;
	menuButton?: ShallowRef<HTMLElement | null>;
	renoteButton?: ShallowRef<HTMLElement | null>;
	renoteTime?: ShallowRef<HTMLElement | null>;
	reactButton?: ShallowRef<HTMLElement | null>;
	heartReactButton?: ShallowRef<HTMLElement | null>;
	quoteButton?: ShallowRef<HTMLElement | null>;
	clipButton?: ShallowRef<HTMLElement | null>;
}

export interface UseNoteOptions {
	inTimeline?: boolean;
	tl_withSensitive?: Ref<boolean>;
	currentClip?: Ref<Misskey.entities.Clip | null> | null;
	currentAntenna?: Ref<Misskey.entities.Antenna | null> | null;
	emit?: (event: 'reaction' | 'removeReaction', emoji: string) => void;
	/**
	 * 長いNoteには自動翻訳を行わない (MkNote用).
	 * 詳細表示のMkNoteDetailedではNote数が少ないため自動翻訳をスキップしない.
	 */
	autoTranslateSkipLong?: boolean;
}

export function calculateMuteStatus<
	CheckOnly extends boolean,
	CheckForSensitiveMedia extends boolean,
	ReturnTypeA = CheckOnly extends true ? boolean : Array<string | string[]> | false | 'sensitiveMute',
	ReturnTypeB = CheckForSensitiveMedia extends true ? ReturnTypeA : Exclude<ReturnTypeA, 'sensitiveMute'>,
>(
	noteToCheck: Misskey.entities.Note,
	user: typeof $i,
	mutedWords: Array<string | string[]> | null,
	checkForSensitiveMedia: CheckForSensitiveMedia,
	checkOnly: CheckOnly = false as CheckOnly,
): ReturnTypeB {
	if (mutedWords != null) {
		const result = checkWordMute(noteToCheck, user, mutedWords);
		if (Array.isArray(result)) return checkOnly ? (result.length > 0) as ReturnTypeB : result as ReturnTypeB;

		const replyResult = noteToCheck.reply && checkWordMute(noteToCheck.reply, user, mutedWords);
		if (Array.isArray(replyResult)) return checkOnly ? (replyResult.length > 0) as ReturnTypeB : replyResult as ReturnTypeB;

		const renoteResult = noteToCheck.renote && checkWordMute(noteToCheck.renote, user, mutedWords);
		if (Array.isArray(renoteResult)) return checkOnly ? (renoteResult.length > 0) as ReturnTypeB : renoteResult as ReturnTypeB;
	}

	if (checkOnly) return false as ReturnTypeB;

	if (checkForSensitiveMedia && noteToCheck.files?.some((v) => v.isSensitive)) {
		return 'sensitiveMute' as ReturnTypeB;
	}

	return false as ReturnTypeB;
}

/** MkNote, MkNoteDetailedの共通ロジック */
export function useNote(
	props: UseNoteProps,
	els: UseNoteElements = {},
	options: UseNoteOptions = {},
) {
	const inTimeline = options.inTimeline ?? false;
	const tl_withSensitive = options.tl_withSensitive ?? ref(true);
	const currentClip = options.currentClip ?? null;
	const currentAntenna = options.currentAntenna ?? null;
	const autoTranslateSkipLong = options.autoTranslateSkipLong ?? false;
	const router = useRouter();

	// プラグインの割り込み処理
	let rawNote = deepClone(props.note);
	const hideByPlugin = ref(false);
	const noteViewInterruptors = getPluginHandlers('note_view_interruptor');

	if (noteViewInterruptors.length > 0) {
		let result: Misskey.entities.Note | null = deepClone(rawNote);
		for (const interruptor of noteViewInterruptors) {
			try {
				result = interruptor.handler(result!) as Misskey.entities.Note | null;
			} catch (err) {
				console.error(err);
			}
		}
		if (result == null) {
			hideByPlugin.value = true;
		} else {
			rawNote = result as Misskey.entities.Note;
		}
	}

	// 基本状態
	const isRenote = Misskey.note.isPureRenote(rawNote);
	const appearNote = getAppearNote(rawNote) ?? rawNote;

	// キャプチャ（ストリーム購読）
	const { $note: $appearNote, subscribe: subscribeManuallyToNoteCapture } = useNoteCapture({
		note: appearNote,
		parentNote: rawNote,
		mock: props.mock,
	});

	// 各種フラグ状態
	const showContent = ref(false);
	const isDeleted = ref(false);
	const translateStatus = ref<TranslateStatus>('none');
	const translation = ref<Misskey.entities.NotesTranslateResponse | null>(null);
	const viewTextSource = ref(false);
	const noNyaize = ref(false);

	// ミュート判定
	const muted = ref($i ? calculateMuteStatus(appearNote, $i, $i.mutedWords, inTimeline && !tl_withSensitive.value) : false);
	const hardMuted = ref(props.withHardMute && $i ? calculateMuteStatus(appearNote, $i, $i.hardMutedWords, inTimeline && !tl_withSensitive.value, true) : false);

	// 計算プロパティ (Computed)
	const isMyRenote = computed(() => $i && ($i.id === rawNote.userId));
	const parsed = computed(() => appearNote.text ? parseMfmCached(appearNote.text) : null);
	const urls = computed(() => parsed.value ? extractUrlFromMfm(parsed.value).filter((url) => appearNote.renote?.url !== url && appearNote.renote?.uri !== url) : null);
	const isLong = computed(() => shouldCollapsed(appearNote, urls.value ?? []));
	const isMFM = computed(() => shouldMfmCollapsed(appearNote));
	const collapsed = ref(appearNote.cw == null && ((isLong.value && prefer.s.collapseLongNoteContent) || (isMFM.value && prefer.s.collapseDefault) || ((appearNote.files?.length ?? 0) > 0 && prefer.s.allMediaNoteCollapse)));
	watch(viewTextSource, () => {
		collapsed.value = false;
	});
	const showTicker = computed(() => (prefer.s.instanceTicker === 'always') || (prefer.s.instanceTicker === 'remote' && appearNote.user.instance));
	const canRenote = computed(() => ['public', 'home'].includes(appearNote.visibility) || (appearNote.visibility === 'followers' && appearNote.userId === $i?.id));
	const renoteCollapsed = ref(
		isRenote && (
			prefer.s.forceCollapseAllRenotes || (
				prefer.s.collapseRenotes && (
					($i && ($i.id === rawNote.userId || $i.id === appearNote.userId)) || // `||` must be `||`! See https://github.com/misskey-dev/misskey/issues/13131
					($appearNote.myReaction != null)
				)
			)
		),
	);
	const replyCollapsed = ref(
		prefer.s.collapseReplies && appearNote.reply && $appearNote.myReaction == null,
	);
	const expandOnNoteClick = prefer.s.expandOnNoteClick;

	const collapseLabel = computed(() => {
		return concat([
			appearNote.files && appearNote.files.length !== 0 ? [i18n.tsx._cw.files({ count: appearNote.files.length })] : [],
		] as string[][]).join(' / ');
	});

	const replyTo = computed(() => {
		const username = appearNote.reply?.user.host == null ? `@${appearNote.reply?.user.username}` : `@${appearNote.reply?.user.username}@${toUnicode(appearNote.reply?.user.host)}`;
		const text = i18n.tsx.replyTo({ user: username });
		const user = `<span style="color: var(--MI_THEME-accent); margin-right: 0.25em;">${username}</span>`;

		return text.replace(username, user);
	});

	const pleaseLoginContext = computed<OpenOnRemoteOptions>(() => ({
		type: 'lookup',
		url: `https://${host}/notes/${appearNote.id}`,
	}));

	// グローバルイベントの監視
	useGlobalEvent('noteDeleted', (noteId) => {
		if (noteId === rawNote.id || noteId === appearNote.id) {
			isDeleted.value = true;
		}
	});

	// MFM絵文字リアクション（Note本文中のセルフ絵文字など）のコールバック
	provide(DI.mfmEmojiReactCallback, (reaction) => {
		sound.playMisskeySfx('reaction');
		notesReactionsCreate({
			noteId: appearNote.id,
			reaction: reaction,
		}).then(({ canceled }) => {
			if (canceled) return;
			noteEvents.emit(`reacted:${appearNote.id}`, {
				userId: $i!.id,
				reaction: reaction,
			});
		});
	});

	// ツールチップのセットアップ (Mockでない場合のみ)
	if (!props.mock) {
		if (els.renoteButton != null) {
			useTooltip(els.renoteButton, async (showing) => {
				const renotes = await misskeyApi('notes/renotes', {
					noteId: appearNote.id,
					limit: 11,
				});

				const users = renotes.map(x => x.user);

				if (users.length < 1 || els.renoteButton!.value == null) return;

				const { dispose } = os.popup(MkUsersTooltip, {
					showing,
					users,
					count: appearNote.renoteCount,
					anchorElement: els.renoteButton!.value,
				}, {
					closed: () => dispose(),
				});
			});
		}

		if (appearNote.reactionAcceptance === 'likeOnly' && els.reactButton != null) {
			useTooltip(els.reactButton, async (showing) => {
				const reactions = await misskeyApiGet('notes/reactions', {
					noteId: appearNote.id,
					limit: 10,
					_cacheKey_: $appearNote.reactionCount,
				});

				const users = reactions.map(x => x.user);

				if (users.length < 1) return;

				const { dispose } = os.popup(MkReactionsViewerDetails, {
					showing,
					reaction: '❤️',
					users,
					count: $appearNote.reactionCount,
					anchorElement: els.reactButton!.value!,
				}, {
					closed: () => dispose(),
				});
			});
		}
	}

	if (prefer.s.alwaysShowCw) showContent.value = true;

	function focus(): void {
		els.rootEl?.value?.focus();
	}

	function blur(): void {
		els.rootEl?.value?.blur();
	}

	function noteClick(ev: MouseEvent): void {
		if (!expandOnNoteClick || window.getSelection()?.toString() !== '' || prefer.s.expandOnNoteClickBehavior === 'doubleClick') ev.stopPropagation();
		else router.pushByPath(notePage(appearNote));
	}

	function noteDblClick(ev: MouseEvent): void {
		if (!expandOnNoteClick || window.getSelection()?.toString() !== '' || prefer.s.expandOnNoteClickBehavior === 'click') ev.stopPropagation();
		else router.pushByPath(notePage(appearNote));
	}

	async function renote(): Promise<void> {
		haptic();

		if (props.mock) return;

		const isLoggedIn = await pleaseLogin({ openOnRemote: pleaseLoginContext.value });
		if (!isLoggedIn) return;

		showMovedDialog();

		if (els.renoteButton == null) return;

		const { menu } = await getRenoteMenu({ note: rawNote, renoteButton: els.renoteButton, mock: props.mock });
		os.popupMenu(menu, els.renoteButton.value);

		// リノート後は反応が来る可能性があるので手動で購読する
		subscribeManuallyToNoteCapture();
	}

	async function renoteOnly(): Promise<void> {
		haptic();

		pleaseLogin({ openOnRemote: pleaseLoginContext.value });
		showMovedDialog();

		if (els.renoteButton == null) return;

		await getRenoteOnly({ note: rawNote, renoteButton: els.renoteButton, mock: props.mock });
	}

	function quote(): void {
		haptic();

		pleaseLogin({ openOnRemote: pleaseLoginContext.value });
		if (!$i) return;
		if (props.mock) return;
		if (appearNote.channel) {
			if (appearNote.channel.allowRenoteToExternal) {
				const { menu } = getQuoteMenu({ note: rawNote, mock: props.mock });
				os.popupMenu(menu, els.quoteButton?.value);
			} else {
				os.post({
					renote: appearNote,
					channel: appearNote.channel,
				}).then(() => {
					focus();
				});
			}
		} else {
			os.post({
				renote: appearNote,
			}).then(() => {
				focus();
			});
		}
	}

	async function reply(): Promise<void> {
		haptic();

		if (props.mock) return;

		const isLoggedIn = await pleaseLogin({ openOnRemote: pleaseLoginContext.value });
		if (!$i) return;
		if (!isLoggedIn) return;

		os.post({
			reply: appearNote,
			channel: appearNote.channel,
		}).then(() => {
			focus();
		});
	}

	async function react(): Promise<void> {
		haptic();

		const isLoggedIn = await pleaseLogin({ openOnRemote: pleaseLoginContext.value });
		if (!isLoggedIn) return;

		showMovedDialog();
		if (appearNote.reactionAcceptance === 'likeOnly') {
			if (props.mock) return;

			notesReactionsCreate({
				noteId: appearNote.id,
				reaction: '❤️',
			}).then(({ canceled }) => {
				if (canceled) return;
				noteEvents.emit(`reacted:${appearNote.id}`, {
					userId: $i!.id,
					reaction: '❤️',
				});
			});
			const el = els.reactButton?.value;
			if (el && prefer.s.animation) {
				const rect = el.getBoundingClientRect();
				const x = rect.left + (el.offsetWidth / 2);
				const y = rect.top + (el.offsetHeight / 2);
				const { dispose } = os.popup(MkRippleEffect, { x, y }, {
					end: () => dispose(),
				});
			}
		} else {
			blur();
			reactionPicker.show(els.reactButton?.value ?? null, rawNote, async (reaction) => {
				if (props.mock) {
					options.emit?.('reaction', reaction);
					$appearNote.reactions[reaction] = 1;
					$appearNote.reactionCount++;
					$appearNote.myReaction = reaction;
					return;
				}

				await toggleReaction(reaction);
			}, () => {
				focus();
			});
		}
	}

	async function toggleReaction(reaction: string): Promise<void> {
		const oldReaction = $appearNote.myReaction;
		if (oldReaction) {
			const confirm = await os.confirm({
				type: 'warning',
				text: oldReaction !== reaction ? i18n.ts.changeReactionConfirm : i18n.ts.cancelReactionConfirm,
			});
			if (confirm.canceled) return;

			sound.playMisskeySfx('reaction');

			misskeyApi('notes/reactions/delete', {
				noteId: rawNote.id,
			}).then(() => {
				noteEvents.emit(`unreacted:${appearNote.id}`, {
					userId: $i!.id,
					reaction: oldReaction,
				});

				if (oldReaction !== reaction) {
					misskeyApi('notes/reactions/create', {
						noteId: rawNote.id,
						reaction: reaction,
					}).then(() => {
						noteEvents.emit(`reacted:${appearNote.id}`, {
							userId: $i!.id,
							reaction: reaction,
						});
					});
				}
			});
		} else {
			notesReactionsCreate({
				noteId: appearNote.id,
				reaction: reaction,
			}).then(({ canceled }) => {
				if (canceled) return;
				noteEvents.emit(`reacted:${appearNote.id}`, {
					userId: $i!.id,
					reaction: reaction,
				});
			});
		}

		if (appearNote.text && appearNote.text.length > 100 && (Date.now() - new Date(appearNote.createdAt).getTime() < 1000 * 3)) {
			claimAchievement('reactWithoutRead');
		}
	}

	function heartReact(): void {
		haptic();

		pleaseLogin({ openOnRemote: pleaseLoginContext.value });
		showMovedDialog();

		if (props.mock) return;

		notesReactionsCreate({
			noteId: appearNote.id,
			reaction: prefer.s.selectReaction,
		}).then(({ canceled }) => {
			if (canceled) return;

			noteEvents.emit(`reacted:${appearNote.id}`, {
				userId: $i!.id,
				reaction: prefer.s.selectReaction,
			});

			if (appearNote.text && appearNote.text.length > 100 && (Date.now() - new Date(appearNote.createdAt).getTime() < 1000 * 3)) {
				claimAchievement('reactWithoutRead');
			}

			const el = els.heartReactButton?.value;
			if (el && prefer.s.animation) {
				const rect = el.getBoundingClientRect();
				const x = rect.left + (el.offsetWidth / 2);
				const y = rect.top + (el.offsetHeight / 2);
				const { dispose } = os.popup(MkRippleEffect, { x, y }, {
					end: () => dispose(),
				});
			}
		});
	}

	function undoReact(): void {
		const oldReaction = $appearNote.myReaction;
		if (!oldReaction) return;

		if (props.mock) {
			options.emit?.('removeReaction', oldReaction);
			return;
		}

		misskeyApi('notes/reactions/delete', {
			noteId: appearNote.id,
		}).then(() => {
			noteEvents.emit(`unreacted:${appearNote.id}`, {
				userId: $i!.id,
				reaction: oldReaction,
			});
		});
	}

	function toggleReact(): void {
		haptic();

		if ($appearNote.myReaction == null) {
			react();
		} else {
			undoReact();
		}
	}

	function onContextmenu(ev: PointerEvent): void {
		if (props.mock) return;

		if (ev.target && isLink(ev.target as HTMLElement)) return;
		if (window.getSelection()?.toString() !== '') return;

		if (prefer.s.useReactionPickerForContextMenu) {
			ev.preventDefault();
			react();
		} else {
			const { menu, cleanup } = getNoteMenu({ note: rawNote, collapsed, translation, translateStatus, viewTextSource, noNyaize, currentClip: currentClip?.value, currentAntenna: currentAntenna?.value ?? undefined });
			os.contextMenu(menu, ev).then(focus).finally(cleanup);
		}
	}

	function showMenu(): void {
		if (props.mock || els.menuButton == null) return;

		haptic();

		const { menu, cleanup } = getNoteMenu({ note: rawNote, collapsed, translation, translateStatus, viewTextSource, noNyaize, currentClip: currentClip?.value, currentAntenna: currentAntenna?.value ?? undefined });
		os.popupMenu(menu, els.menuButton.value).then(focus).finally(cleanup);
	}

	async function clip(): Promise<void> {
		haptic();

		if (props.mock) return;

		os.popupMenu(await getNoteClipMenu({ note: rawNote, currentClip: currentClip?.value }), els.clipButton?.value).then(focus);
	}

	const isForeignLanguage: boolean = (appearNote.text != null || appearNote.poll != null) && (() => {
		const targetLang = (miLocalStorage.getItem('lang') ?? navigator.language).slice(0, 2);
		if (appearNote.text) {
			const postLang = detectLanguage(appearNote.text);
			if (postLang !== '' && postLang !== targetLang) return true;
		}
		if (appearNote.poll) {
			const foreignLang = appearNote.poll.choices
				.map((choice) => detectLanguage(choice.text))
				.filter((lang) => lang !== targetLang).length;
			if (0 < foreignLang) return true;
		}
		return false;
	})();

	if (
		prefer.s.useAutoTranslate &&
		instance.translatorAvailable &&
		$i && $i.policies.canUseTranslator && $i.policies.canUseAutoTranslate &&
		(!autoTranslateSkipLong || !isLong.value) &&
		(appearNote.cw == null || showContent.value) &&
		appearNote.text && isForeignLanguage
	) {
		translate(true);
	}

	async function translate(isAuto: boolean): Promise<void> {
		if (translation.value != null) return;
		translateStatus.value = 'running';
		collapsed.value = false;

		if (appearNote.text == null) {
			translateStatus.value = 'success';
			translation.value = null;
			return;
		}

		if (!isAuto) {
			haptic();
		}

		if (props.mock) return;

		await misskeyApi('notes/translate', {
			noteId: appearNote.id,
			targetLang: miLocalStorage.getItem('lang') ?? navigator.language,
		}).then((r) => {
			translateStatus.value = 'success';
			translation.value = r;
		}).catch((err) => {
			translateStatus.value = 'error';
			translation.value = null;
			if (!isAuto) {
				os.alert(
					{
						type: 'error',
						title: i18n.ts.translateError,
						text: err.id,
					});
			}
		});
	}

	return {
		// 状態・データ
		note: rawNote,
		appearNote,
		$appearNote,
		hideByPlugin,
		isRenote,
		showContent,
		isDeleted,
		translateStatus,
		translation,
		viewTextSource,
		noNyaize,
		muted,
		hardMuted,
		collapsed,
		renoteCollapsed,
		replyCollapsed,
		expandOnNoteClick,
		pleaseLoginContext,

		// 計算プロパティ
		isMyRenote,
		parsed,
		urls,
		isLong,
		isMFM,
		isForeignLanguage,
		showTicker,
		canRenote,
		collapseLabel,
		replyTo,

		// アクション関数
		renote,
		renoteOnly,
		quote,
		reply,
		react,
		toggleReact,
		heartReact,
		onContextmenu,
		showMenu,
		clip,
		translate,
		noteClick,
		noteDblClick,
		focus,
		blur,
	};
}
