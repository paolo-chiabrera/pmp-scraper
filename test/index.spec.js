import {expect} from 'chai';
import sinon from 'sinon';

import needle from 'needle';
import async from 'async';

import main from '../lib/modules/main';

import mocks from './mocks';

import PmpScraper from '../lib/index';

describe('pmp-scraper', function () {
  let pmpScraper;

  beforeEach(function () {
    pmpScraper = new PmpScraper({
      request: {
        headers: {
          'Authorization': 'test'
        }
      }
    });
  });

  it('should be defined', function () {
    expect(pmpScraper).to.be.an('object');
  });

  describe('constructor', function () {
    it('should set all the properties', function () {
      expect(pmpScraper.source).to.be.a('null');

      expect(pmpScraper.pageNumber).to.be.a('number');

      expect(pmpScraper.options).to.be.an('object');
      expect(pmpScraper.options.pmpApiUrl).to.equal('http://api.picmeplease.eu');
      expect(pmpScraper.options.scraperApiUrl).to.equal('http://api.scraper.d3lirium.eu');
      expect(pmpScraper.options.concurrency).to.be.a('number');
      expect(pmpScraper.options.request).to.be.an('object');
      expect(pmpScraper.options.request.json).to.be.a('boolean');
      expect(pmpScraper.options.request.headers).to.be.an('object');
      expect(pmpScraper.options.request.headers.Authorization).to.eql('test');
    });
  });

  describe('scrapePage', function () {

    let getPageUrl, scrapeUrl, filterLinks, filterDuplicates, getImagesThreshold, saveImages, generateReport, updateStats;

    beforeEach(function () {
      getPageUrl = sinon.stub(main, 'getPageUrl', (args, done) => {
        done(null, {
          url: mocks.targetUrl
        });
      });
      scrapeUrl = sinon.stub(main, 'scrapeUrl', (args, done) => {
        done(null, {
          results: mocks.scrapedUrls
        });
      });
      filterLinks = sinon.stub(main, 'filterLinks', (args, done) => {
        done(null, {
          links: mocks.filteredLinks
        });
      });
      filterDuplicates = sinon.stub(main, 'filterDuplicates', (args, done) => {
        done(null, {
          links: mocks.filteredDuplicates
        });
      });
      getImagesThreshold = sinon.stub(main, 'getImagesThreshold', (args, done) => {
        done(null, {
          perc: 1
        });
      });
      saveImages = sinon.stub(main, 'saveImages', (args, done) => {
        done(null, {});
      });
      generateReport = sinon.stub(main, 'generateReport', (args, done) => {
        done(null, {});
      });
      updateStats = sinon.stub(pmpScraper.stats, 'updateStats', (args, done) => {
        done(null, {});
      });
    });

    afterEach(function () {
      getPageUrl.restore();
      scrapeUrl.restore();
      filterLinks.restore();
      filterDuplicates.restore();
      getImagesThreshold.restore();
      saveImages.restore();
      generateReport.restore();
      updateStats.restore();
    });

    it('should be defined', function () {
      expect(pmpScraper.scrapePage).to.be.a('function');
    });

    it('should return an error: validation', sinon.test(function (done) {
      const cb = this.spy(err => {
        expect(err).to.be.an('error');
        done();
      });

      pmpScraper.scrapePage({}, cb);
    }));

    it('should return an error: async.auto', sinon.test(function (done) {
      const fakeError = new Error('error');
      const auto = this.stub(async, 'auto', (args, done) => {
        done(fakeError);
      });

      const cb = this.spy(err => {
        expect(err).to.eql(fakeError);
        sinon.assert.calledOnce(auto);

        auto.restore();
        done();
      });

      pmpScraper.scrapePage({
        options: mocks.options,
        pageNumber: mocks.pageNumber,
        source: mocks.source
      }, cb);
    }));

    it('should call all the chained methods', sinon.test(function (done) {
      const auto = this.spy(async, 'auto');

      const cb = this.spy(err => {
        expect(err).to.be.a('null');
        sinon.assert.calledOnce(auto);
        sinon.assert.calledOnce(getPageUrl);
        sinon.assert.calledOnce(scrapeUrl);
        sinon.assert.calledOnce(filterLinks);
        sinon.assert.calledOnce(filterDuplicates);
        sinon.assert.calledOnce(getImagesThreshold);
        sinon.assert.calledOnce(saveImages);

        auto.restore();
        done();
      });

      pmpScraper.scrapePage({
        options: mocks.options,
        pageNumber: mocks.pageNumber,
        source: mocks.source
      }, cb);
    }));
  });

  describe('scrapePageForever', function () {

    let reindexImages;

    beforeEach(function () {
      reindexImages = sinon.stub(main, 'reindexImages', (args, done) => {
        done(null, mocks.reindex);
      });
    });

    afterEach(function () {
      reindexImages.restore();
    });

    it('should be defined', function () {
      expect(pmpScraper.scrapePageForever).to.be.a('function');
    });

    it('should return an error: validation', sinon.test(function (done) {
      const cb = this.spy(err => {
        expect(err).to.be.an('error');
        done();
      });

      pmpScraper.scrapePageForever({}, cb);
    }));

    it('should return an error: async.forever', sinon.test(function (done) {
      const fakeError = new Error('fakeError');
      const forever = this.stub(async, 'forever', (worker, callback) => {
        callback(fakeError);
      });
      const emit = this.stub(pmpScraper, 'emit');

      const cb = this.spy(err => {
        expect(err).to.be.a('null');
        sinon.assert.calledOnce(forever);
        sinon.assert.calledWith(emit, 'scrape-error', fakeError);

        forever.restore();
        emit.restore();
        done();
      });

      pmpScraper.scrapePageForever({
        source: mocks.source
      }, cb);
    }));

    it('should return an error: scrapePage', sinon.test(function (done) {
      const fakeError = new Error('fakeError');
      const scrapePage = this.stub(pmpScraper, 'scrapePage', (args, done) => {
        done(fakeError);
      });
      const emit = this.stub(pmpScraper, 'emit');

      const cb = this.spy(err => {
        expect(err).to.be.a('null');
        sinon.assert.calledOnce(scrapePage);
        sinon.assert.calledWith(emit, 'scrape-error', fakeError);

        scrapePage.restore();
        emit.restore();
        done();
      });

      pmpScraper.scrapePageForever({
        source: mocks.source
      }, cb);
    }));

    it('should return a message: threshold', sinon.test(function (done) {
      const thresholdError = new Error('threshold not reached: 0');
      const scrapePage = this.stub(pmpScraper, 'scrapePage', (args, done) => {
        done(null, {
          threshold: 0
        });
      });
      const emit = this.stub(pmpScraper, 'emit');

      const cb = this.spy(err => {
        expect(err).to.be.a('null');
        sinon.assert.calledOnce(scrapePage);
        sinon.assert.calledWith(emit, 'scrape-error', thresholdError);
        sinon.assert.calledWith(emit, 'scrape-end');

        scrapePage.restore();
        emit.restore();
        done();
      });

      pmpScraper.scrapePageForever({
        source: mocks.source
      }, cb);
    }));

    it('should increase the pageNumber', sinon.test(function (done) {
      const thresholdError = new Error('threshold not reached: 0');
      const scrapePage = this.stub(pmpScraper, 'scrapePage', (args, callback) => {
        if(args.pageNumber == 0){
          callback(null, {
            threshold: 1
          });
        } else {
          callback(null, {
            threshold: 0
          });
        }
      });
      const emit = this.stub(pmpScraper, 'emit');

      const cb = this.spy(err => {
        expect(err).to.be.a('null');
        sinon.assert.calledTwice(scrapePage);
        sinon.assert.calledWith(emit, 'scrape-error', thresholdError);
        expect(pmpScraper.pageNumber).to.equal(1);

        scrapePage.restore();
        emit.restore();
        done();
      });

      pmpScraper.scrapePageForever({
        source: mocks.source
      }, cb);
    }));
  });

  describe('reindexImages', function () {
    it('should be defined', function () {
      expect(pmpScraper.reindexImages).to.be.a('function');
    });

    it('should emit an error', sinon.test(function (done) {
      const fakeError = new Error('fakeError');
      const reindexImages = this.stub(main, 'reindexImages', (args, next) => {
        next(fakeError);
      });
      const emit = this.stub(pmpScraper, 'emit');

      pmpScraper.reindexImages();

      sinon.assert.calledOnce(reindexImages);
      sinon.assert.calledWith(emit, 'reindex-start');
      sinon.assert.calledWith(emit, 'reindex-error', fakeError);

      emit.restore();
      reindexImages.restore();
      done();
    }));

    it('should emit the result', sinon.test(function (done) {
      const reindexImages = this.stub(main, 'reindexImages', (args, next) => {
        next(null, mocks.reindex);
      });
      const emit = this.stub(pmpScraper, 'emit');

      pmpScraper.reindexImages();

      sinon.assert.calledOnce(reindexImages);
      sinon.assert.calledWith(emit, 'reindex-start');
      sinon.assert.calledWith(emit, 'reindex-end', mocks.reindex);

      emit.restore();
      reindexImages.restore();
      done();
    }));
  });

  describe('scrape', function () {
    it('should be defined', function () {
      expect(pmpScraper.scrape).to.be.a('function');
    });

    it('should return a validation error', sinon.test(function (done) {
      const cb = this.spy(err => {
        expect(err).to.be.an('error');
        done();
      });

      pmpScraper.scrape(null, cb);
    }));

    it('should forward to scrapeSource', sinon.test(function (done) {
      const data = {
        source: {}
      };

      const scrapeSource = this.stub(pmpScraper, 'scrapeSource', (args, done) => {
        done(null);
      });

      const cb = this.spy((err) => {
        sinon.assert.calledOnce(scrapeSource);
        sinon.assert.calledWith(scrapeSource, data);

        scrapeSource.restore();
        done(err);
      });

      pmpScraper.scrape(data, cb);
    }));

    it('should forward to getSourceById', sinon.test(function (done) {
      const getSourceById = this.stub(pmpScraper, 'getSourceById', (args, done) => {
        done(null, mocks.source);
      });

      const scrapeSource = this.stub(pmpScraper, 'scrapeSource', (args, done) => {
        done(null);
      });

      const cb = this.spy((err) => {
        sinon.assert.calledOnce(getSourceById);
        sinon.assert.calledOnce(scrapeSource);

        getSourceById.restore();
        scrapeSource.restore();
        done(err);
      });

      pmpScraper.scrape({
        source: mocks.source.id
      }, cb);
    }));

    it('should return an error from getSourceById', sinon.test(function (done) {
      const data = {
        source: 'test'
      };

      const fakeError = new Error('error');

      const getSourceById = this.stub(pmpScraper, 'getSourceById', (args, done) => {
        done(fakeError);
      });

      const cb = this.spy((err) => {
        sinon.assert.calledOnce(getSourceById);
        sinon.assert.calledWith(getSourceById, {
          sourceId: 'test'
        });

        expect(err).to.eql(fakeError);

        getSourceById.restore();
        done();
      });

      pmpScraper.scrape(data, cb);
    }));
  });

  describe('getSourceById', function () {
    it('should be defined', function () {
      expect(pmpScraper.getSourceById).to.be.a('function');
    });

    it('should raise a validation error', sinon.test(function (done) {
      const data = {
        sourceId: null
      };

      const cb = this.spy((err) => {
        expect(err).to.be.an('error');
        done();
      });

      pmpScraper.getSourceById(data, cb);
    }));

    it('should raise an error from needle.get', sinon.test(function (done) {
      const data = {
        sourceId: 'test'
      };

      const fakeError = new Error('error');

      const get = this.stub(needle, 'get', (args, options, done) => {
        done(fakeError);
      });

      const cb = this.spy((err) => {
        expect(err).to.eql(fakeError);

        get.restore();
        done();
      });

      pmpScraper.getSourceById(data, cb);
    }));

    it('should raise a statusCode error from needle.get', sinon.test(function (done) {
      const data = {
        sourceId: 'test'
      };

      const statusCode = 401;

      const fakeError = new Error('wrong statusCode ' + statusCode);

      const get = this.stub(needle, 'get', (args, options, done) => {
        done(null, {
          statusCode: statusCode
        });
      });

      const cb = this.spy((err) => {
        expect(err).to.eql(fakeError);

        get.restore();
        done();
      });

      pmpScraper.getSourceById(data, cb);
    }));

    it('should raise an error: source not found', sinon.test(function (done) {
      const data = {
        sourceId: 'test'
      };

      const fakeError = new Error('source not found: ' + data.sourceId);

      const get = this.stub(needle, 'get', (args, options, done) => {
        done(null, {
          statusCode: 200,
          body: null
        });
      });

      const cb = this.spy((err) => {
        expect(err).to.eql(fakeError);

        get.restore();
        done();
      });

      pmpScraper.getSourceById(data, cb);
    }));

    it('should be a success', sinon.test(function (done) {
      const data = {
        sourceId: 'test'
      };

      const get = this.stub(needle, 'get', (args, options, done) => {
        done(null, {
          statusCode: 200,
          body: data
        });
      });

      const cb = this.spy((err, source) => {
        expect(err).to.be.a('null');
        expect(source).to.eql(data);

        get.restore();
        done();
      });

      pmpScraper.getSourceById(data, cb);
    }));
  });

  describe('scrapeSource', function () {
    it('should be defined', function () {
      expect(pmpScraper.scrapeSource).to.be.a('function');
    });

    it('should raise an error: validation', sinon.test(function (done) {
      const cb = this.spy((err) => {
        expect(err).to.be.an('error');
        done();
      });

      pmpScraper.scrapeSource({
        source: {}
      }, cb);
    }));

    it('should raise an error: main.ensureFolderPath', sinon.test(function (done) {
      const fakeError = new Error('fakeError');
      const ensureFolderPath = this.stub(main, 'ensureFolderPath', (args, done) => {
        done(fakeError);
      });

      const cb = this.spy(err => {
        expect(err).to.eql(fakeError);
        sinon.assert.calledOnce(ensureFolderPath);

        ensureFolderPath.restore();
        done();
      });

      pmpScraper.scrapeSource({
        source: mocks.source,
        pageNumber: 0
      }, cb);
    }));

    it('should call scrapePage', sinon.test(function (done) {
      const scrapePage = this.stub(pmpScraper, 'scrapePage', (args, done) => {
        done(null);
      });
      const ensureFolderPath = this.stub(main, 'ensureFolderPath', (args, done) => {
        done(null);
      });

      const cb = this.spy(err => {
        expect(err).to.be.a('null');
        sinon.assert.calledOnce(scrapePage);
        sinon.assert.calledOnce(ensureFolderPath);

        scrapePage.restore();
        ensureFolderPath.restore();
        done();
      });

      pmpScraper.scrapeSource({
        source: mocks.source,
        pageNumber: 0
      }, cb);
    }));

    it('should call scrapePageForever', sinon.test(function (done) {
      const scrapePageForever = this.stub(pmpScraper, 'scrapePageForever', (args, done) => {
        done(null);
      });
      const ensureFolderPath = this.stub(main, 'ensureFolderPath', (args, done) => {
        done(null);
      });

      const cb = this.spy(err => {
        expect(err).to.be.a('null');
        sinon.assert.calledOnce(scrapePageForever);
        sinon.assert.calledOnce(ensureFolderPath);

        scrapePageForever.restore();
        ensureFolderPath.restore();
        done();
      });

      pmpScraper.scrapeSource({
        source: mocks.source
      }, cb);
    }));
  });
});
