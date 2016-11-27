import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

import PmpSource from 'pmp-source';

import main, { scrapeDeep } from '../../lib/modules/main';

import mocks from '../mocks';

describe('scrapeDeep', function () {
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
    expect(scrapeDeep).to.be.a('function');
  });

  it('should return an error: validation', sinon.test(function (done) {
    const cb = this.spy(err => {
      expect(err).to.be.an('error');
      done();
    });

    scrapeDeep({}, cb);
  }));

  it('should return an error: scrapePage', sinon.test(function (done) {
    const fakeError = new Error('error');
    const onScrapePage = this.spy();

    this.stub(main, 'scrapePage', (args, done) => {
      done(fakeError);
    });

    const cb = this.spy(err => {
      expect(getSourceById).to.have.been.calledOnce;
      expect(ensureFolderPath).to.have.been.calledOnce;
      expect(onScrapePage).to.have.been.called;
      expect(err).to.eql(fakeError);
      done();
    });

    scrapeDeep({
      options: mocks.options,
      sourceId: mocks.source.id,
      onScrapePage
    }, cb);
  }));

  it('should return an error: threshold', sinon.test(function (done) {
    const threshold = 0.1;
    const onScrapePage = this.spy();

    this.stub(main, 'scrapePage', (args, done) => {
      done(null, {
        threshold
      });
    });

    const cb = this.spy((err, results) => {
      expect(getSourceById).to.have.been.calledOnce;
      expect(ensureFolderPath).to.have.been.calledOnce;
      expect(onScrapePage).to.have.been.called;
      expect(err).to.be.null;
      expect(results).to.eql({
        pageNumber: 0,
        threshold
      });
      done();
    });

    scrapeDeep({
      options: mocks.options,
      sourceId: mocks.source.id,
      onScrapePage
    }, cb);
  }));

  it('should scrape 2 pages', sinon.test(function (done) {
    const threshold = 0.1;
    const onScrapePage = this.spy();

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
      expect(onScrapePage).to.have.been.calledTwice;
      expect(err).to.be.null;
      expect(results).to.eql({
        pageNumber: 1,
        threshold
      });
      done();
    });

    scrapeDeep({
      options: mocks.options,
      sourceId: mocks.source.id,
      onScrapePage
    }, cb);
  }));
});
