/*
 * SPDX-FileCopyrightText: syuilo and misskey-project, yojo-art team
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';

export const meta = {
	tags: ['officialTags'],

	limit: {
		duration: 1000 * 60,
		max: 10,
	},

	errors: {
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		body: { type: 'string' },
		header: { type: 'string', nullable: true },
		icon: { type: 'string', nullable: true },
	},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
	) {
		super(meta, paramDef, async (ps, user, token) => {
		});
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
		return {
			exec: async () => {
				return official_tags;
			},
		};
	}
}
