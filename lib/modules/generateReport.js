import _ from 'lodash';

export default function generateReport(args, done = _.noop) {
	const {
		savedImages,
		scrapedLinks,
		startTime,
		targetUrl,
		threshold
	} = args;

	const report = {
		execTime: (Date.now() - startTime) / 1000,
		targetUrl,
		numScrapedImages: scrapedLinks.length,
		numSavedImages: savedImages.length,
		threshold
	};

	done(null, {
		report
	});
}
