/*
 * SPDX-FileCopyrightText: syuilo and misskey-project
 * SPDX-License-Identifier: AGPL-3.0-only
 */

export class NoteUpdateAtHistory1696318192428 {
	name = 'NoteUpdateAtHistory1696318192428'

	async up(queryRunner) {
		await queryRunner.query(`ALTER TABLE "note" ADD "updatedAtHistory" TIMESTAMP WITH TIME ZONE array`);
	}

	async down(queryRunner) {
		await queryRunner.query(`ALTER TABLE "note" DROP "updatedAtHistory"`);
	}

}
