import _ from 'lodash';
import async from 'async';

import PmpSource from 'pmp-source';

import main from './main';

export function scrapeDeepAux(args, done = _.noop) {
	const { onProgress = _.noop, options, source } = args;
	let pageNumber = 0;

	async.forever(next => {
		main.scrapePage({
			options,
			source,
			pageNumber
		}, (err, res) => {
			onProgress(err, res);

			if (err) {
				next(err);
				return;
			}

			if (res.threshold < source.threshold) {
				next({
					threshold: res.threshold
				});
				return;
			}

			pageNumber++;
			next(null);
		});
	}, err => {
		if (_.isNumber(err.threshold)) {
			done(null, {
				pageNumber,
				threshold: err.threshold
			});
			return;
		}

		done(err);
	});
}

export default function scrapeDeep(args, done = _.noop) {
	const { onProgress = _.noop, options, sourceId } = args;
	const { folderPath } = options;

	async.auto({
		getSourceById: (next) => {
			PmpSource.getSourceById({
				options,
				sourceId
			}, next);
		},
		ensureFolderPath: (next) => {
			main.ensureFolderPath({
				folderPath
			}, next);
		},
		scrapeDeep: ['getSourceById', 'ensureFolderPath', (results, next) => {
			const { source } = results.getSourceById;

			scrapeDeepAux({
				onProgress,
				options,
				source
			}, next);
		}]
	}, (err, results) => {
		if (err) {
			done(err);
			return;
		}

		done(null, results.scrapeDeep);
	});
}
