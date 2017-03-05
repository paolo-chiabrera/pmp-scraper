import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

import PmpSource from 'pmp-source';

import main, { scrapeSourceById } from '../../lib/modules/main';

import mocks from '../mocks';

describe('scrapeSourceById', function () {
	let getSourceById;
	let ensureFolderPath;

	beforeEach(function () {
		getSourceById = sinon.stub(PmpSource, 'getSourceById', (args, done) => done(null, {
			source: mocks.source
		}));
		ensureFolderPath = sinon.stub(main, 'ensureFolderPath', (args, done) => done(null, {}));
	});

	afterEach(function () {
		getSourceById.restore();
		ensureFolderPath.restore();
	});

	it('should be defined', function () {
		expect(scrapeSourceById).to.be.a('function');
	});

	it('should return an error: scrapePage', sinon.test(function (done) {
		const fakeError = new Error('error');
		const onProgress = this.spy();

		this.stub(main, 'scrapePage', (args, done) => {
			done(fakeError);
		});

		const cb = this.spy(err => {
			expect(getSourceById).to.have.been.calledOnce;
			expect(ensureFolderPath).to.have.been.calledOnce;
			expect(onProgress).to.have.been.called;
			expect(err).to.eql(fakeError);
			done();
		});

		scrapeSourceById({
			options: mocks.options,
			sourceId: mocks.source.id,
			onProgress
		}, cb);
	}));

	it('should return an error: threshold', sinon.test(function (done) {
		const threshold = 0.1;
		const onProgress = this.spy();

		this.stub(main, 'scrapePage', (args, done) => {
			done(null, {
				threshold
			});
		});

		const cb = this.spy((err, results) => {
			expect(getSourceById).to.have.been.calledOnce;
			expect(ensureFolderPath).to.have.been.calledOnce;
			expect(onProgress).to.have.been.called;
			expect(err).to.be.null;
			expect(results).to.eql({
				pageNumber: 0,
				threshold
			});
			done();
		});

		scrapeSourceById({
			options: mocks.options,
			sourceId: mocks.source.id,
			onProgress
		}, cb);
	}));

	it('should scrape 2 pages', sinon.test(function (done) {
		const threshold = 0.1;
		const onProgress = this.spy();

		this.stub(main, 'scrapePage', (args, done) => {
			if (args.pageNumber === 0) {
				done(null, {
					threshold: 1
				});
				return;
			}

			done(null, {
				threshold
			});
		});

		const cb = this.spy((err, results) => {
			expect(getSourceById).to.have.been.calledOnce;
			expect(ensureFolderPath).to.have.been.calledOnce;
			expect(onProgress).to.have.been.calledTwice;
			expect(err).to.be.null;
			expect(results).to.eql({
				pageNumber: 1,
				threshold
			});
			done();
		});

		scrapeSourceById({
			options: mocks.options,
			sourceId: mocks.source.id,
			onProgress
		}, cb);
	}));
});
