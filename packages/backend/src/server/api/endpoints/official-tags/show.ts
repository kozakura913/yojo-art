/*
 * SPDX-FileCopyrightText: syuilo and misskey-project, yojo-art team
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';

export const meta = {
	tags: ['official-Tags'],
	res: {
		type: 'array',
		optional: false, nullable: false,
		items: {
			type: 'object',
			properties: {
				tag: {
					type: 'string',
					optional: false, nullable: false,
				},
				description: {
					type: 'string',
					optional: false, nullable: true,
				},
				bannerUrl: {
					type: 'string',
					optional: false, nullable: true,
				},
			},
		},
	},
} as const;

export const paramDef = {
	type: 'object',
	properties: {
	},
	required: [],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
	) {
		super(meta, paramDef, async (ps, me) => {
			return await [
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
		});
	}
}
