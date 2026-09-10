/*
 * SPDX-FileCopyrightText: syuilo and misskey-project, yojo-art team
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import util from 'util';
import stripAnsi from 'strip-ansi';
import type { Log } from '@google-cloud/logging';
import type { LogBackend } from './LogBackend.js';
import type { LogRecord, LogLevel } from './types.js';

/**
 * 正規化済みのログをGoogle Cloud Loggingへ出力するための出力先です。
 * yojo-art 独自機能として、コンソール出力とは別にCloud Loggingへも送信します。
 */
export class CloudLoggingBackend implements LogBackend {
	private readonly log: Log;

	constructor(log: Log) {
		this.log = log;
	}

	public write(record: LogRecord): void {
		// Cloud LoggingのLogSeverityは`warn`ではなく`WARNING`。`fatal`は存在しないため`ERROR`として扱います。
		const severityMap: Record<LogLevel, string> = {
			debug: 'DEBUG',
			info: 'INFO',
			warn: 'WARNING',
			error: 'ERROR',
			fatal: 'ERROR',
		};

		const logMessage = stripAnsi(record.message);
		const metadata = {
			severity: severityMap[record.level],
			timestamp: new Date(record.timestamp),
			resource: {
				type: 'global',
			},
			labels: {
				name: record.loggerName,
			},
		};

		const dataString = record.compatibility?.data != null
			? '\n' + util.inspect(record.compatibility.data, { depth: null })
			: '';
		const entry = this.log.entry(metadata, logMessage + dataString);

		this.log.write(entry).catch(() => {});
	}
}
