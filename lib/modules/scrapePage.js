import _ from 'lodash';
import async from 'async';

import PmpPage from 'pmp-page';
import PmpImage from 'pmp-image';

import main from './main';

export default function scrapePage(args, done = _.noop) {
	const { options, pageNumber, source } = args;

	const START_TIME = Date.now();

	async.auto({
		scrapePage: next => {
			PmpPage.scrape({
				pageNumber,
				options,
				source
			}, next);
		},
		saveImages: ['scrapePage', (results, next) => {
			const { links } = results.scrapePage;

			PmpImage.saveBatch({
				links,
				options,
				sourceId: source.id
			}, next);
		}],
		generateReport: ['saveImages', (results, next) => {
			const { links, pageUrl, threshold } = results.scrapePage;
			const { images } = results.saveImages;

			main.generateReport({
				targetUrl: pageUrl,
				scrapedLinks: links,
				threshold,
				savedImages: images,
				startTime: START_TIME
			}, next);
		}]
	}, (err, results) => {
		if (err) {
			done(err);
			return;
		}

		done(null, {
			errors: results.saveImages.errors,
			pageNumber,
			report: results.generateReport.report
		});
	});
}
