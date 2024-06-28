/*
 * SPDX-FileCopyrightText: syuilo and misskey-project, yojo-art team
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Injectable } from '@nestjs/common';
import { Endpoint } from '@/server/api/endpoint-base.js';
import { ApiError } from '../../error.js';

export const meta = {
	tags: ['official-Tags'],

	requireCredential: true,
	requireModerator: true,
	requireAdmin: true,
	kind: 'updateOfficialTags',

	limit: {
		duration: 1000 * 60,
		max: 10,
	},

	errors: {
		unimplemented: {
			message: 'Unimplemented',
			code: 'UN_IMPLEMENTED',
			id: 'e842f9d1-b9e0-4e63-8230-0a1775457b27',
		},
	},
	secure: true,
} as const;

export const paramDef = {
	type: 'object',
	properties: {
		body: { type: 'string' },
		header: { type: 'string', nullable: true },
		icon: { type: 'string', nullable: true },
	},
	required: ['body'],
} as const;

@Injectable()
export default class extends Endpoint<typeof meta, typeof paramDef> { // eslint-disable-line import/no-default-export
	constructor(
	) {
		super(meta, paramDef, async (ps, user, token) => {
			throw new ApiError(meta.errors.unimplemented);
		});
	}
}
