<!--
SPDX-FileCopyrightText: syuilo and misskey-project, yojo-art team
SPDX-License-Identifier: AGPL-3.0-only
-->

<template>
<MkStickyContainer>
	<template #header><MkPageHeader/></template>

	<MkSpacer :contentMax="500">
		<div class="_gaps">
			<MkOfficialTag v-for="tag in official_tags" :key="tag.tag" :tagString="tag.tag" :description="tag.description" :bannerUrl="tag.bannerUrl"/>
		</div>
	</MkSpacer>
</MkStickyContainer>
</template>

<script lang="ts" setup>
import { definePageMetadata } from '@/scripts/page-metadata.js';
import { i18n } from '@/i18n.js';

const official_tags = [
	{
		tag: 'test',
		description: 'テストタグの説明文',
		bannerUrl: 'https://misskey-files.kzkr.xyz/files/065f42e8-f03b-4c89-96a7-ec8b23650de0.png',
	},
	{
		tag: 'aaaa',
		description: 'あああああああああ',
		bannerUrl: null,
	},
	{
		tag: 'にゃーん',
		description: 'にゃああああああ',
		bannerUrl: null,
	},
];

definePageMetadata(() => ({
	title: i18n.ts._official_tag.title,
	icon: 'ti ti-bookmarks',
}));
</script>

