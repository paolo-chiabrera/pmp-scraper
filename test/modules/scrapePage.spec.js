import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

import PmpPage from 'pmp-page';
import PmpImage from 'pmp-image';

import main, { scrapePage } from '../../lib/modules/main';

import mocks from '../mocks';

describe('scrapePage', function () {
	let scrape;
	let saveBatch;

	beforeEach(function () {
		scrape = sinon.stub(PmpPage, 'scrape', (args, done) => done(null, {
			pageUrl: mocks.targetUrl,
			scrapedLinks: mocks.scrapedUrls,
			threshold: mocks.source.threshold
		}));
		saveBatch = sinon.stub(PmpImage, 'saveBatch', (args, done) => done(null, {
			images: mocks.savedImages,
			errors: []
		}));
	});

	afterEach(function () {
		scrape.restore();
		saveBatch.restore();
	});

	it('should be defined', function () {
		expect(scrapePage).to.be.a('function');
	});

	it('should return an error: async.auto', sinon.test(function () {
		const cb = this.spy();
		const fakeError = new Error('error');

		const generateReport = this.stub(main, 'generateReport', (args, done) => {
			done(fakeError);
		});

		scrapePage({
			options: mocks.options,
			pageNumber: mocks.pageNumber,
			source: mocks.source
		}, cb);

		expect(scrape).to.have.been.calledOnce;
		expect(saveBatch).to.have.been.calledOnce;
		expect(generateReport).to.have.been.calledOnce;
		expect(cb).to.have.been.calledWith(fakeError);
	}));

	it('should return the results', sinon.test(function () {
		const cb = this.spy();
		const results = {
			errors: [],
			pageNumber: mocks.pageNumber,
			report: {}
		};

		const generateReport = this.stub(main, 'generateReport', (args, done) => {
			done(null, {
				report: results.report
			});
		});

		scrapePage({
			options: mocks.options,
			pageNumber: mocks.pageNumber,
			source: mocks.source
		}, cb);

		expect(scrape).to.have.been.calledOnce;
		expect(saveBatch).to.have.been.calledOnce;
		expect(generateReport).to.have.been.calledOnce;
		expect(cb).to.have.been.calledWith(null, results);
	}));
});
