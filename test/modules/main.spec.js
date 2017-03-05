import { expect } from 'chai';

import main from '../../lib/modules/main';

describe('main', () => {
	it('should be an object', () => {
		expect(main).to.be.an('object');
	});

	it('should expose generateReport', () => {
		expect(main.generateReport).to.be.a('function');
	});

	it('should expose ensureFolderPath', () => {
		expect(main.ensureFolderPath).to.be.a('function');
	});

	it('should expose scrapePage', () => {
		expect(main.scrapePage).to.be.a('function');
	});

	it('should expose scrapePageBySourceId', () => {
		expect(main.scrapePageBySourceId).to.be.a('function');
	});

	it('should expose scrapeSourceById', () => {
		expect(main.scrapeSourceById).to.be.a('function');
	});
});
