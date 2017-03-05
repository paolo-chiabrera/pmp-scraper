import _ from 'lodash';
import async from 'async';

import PmpSource from 'pmp-source';

import main from './main';

export default function scrapePageBySourceId(args, done = _.noop) {
	const { options, pageNumber, sourceId } = args;
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
		}
	}, (err, results) => {
		if (err) {
			done(err);
			return;
		}

		main.scrapePage({
			options,
			pageNumber,
			source: results.getSourceById.source
		}, done);
	});
}
