import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(sinonChai);

import PmpSource from 'pmp-source';

import main, { scrapePageBySourceId } from '../../lib/modules/main';

import mocks from '../mocks';

describe('scrapePageBySourceId', function () {
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
    expect(scrapePageBySourceId).to.be.a('function');
  });

  it('should return an error: validation', sinon.test(function (done) {
    const cb = this.spy(err => {
      expect(err).to.be.an('error');
      done();
    });

    scrapePageBySourceId({}, cb);
  }));

  it('should return an error: async.auto', sinon.test(function () {
    const cb = this.spy();
    const fakeError = new Error('error');

    ensureFolderPath.restore();
    ensureFolderPath = this.stub(main, 'ensureFolderPath', (args, done) => {
      done(fakeError);
    });

    scrapePageBySourceId({
      options: mocks.options,
      pageNumber: mocks.pageNumber,
      sourceId: mocks.source.id
    }, cb);

    expect(getSourceById).to.have.been.calledOnce;
    expect(ensureFolderPath).to.have.been.calledOnce;
    expect(cb).to.have.been.calledWith(fakeError);
  }));

  it('should return the results', sinon.test(function () {
    const cb = this.spy();
    const results = {
      errors: [],
      pageNumber: mocks.pageNumber,
      report: {}
    };

    const scrapePage = this.stub(main, 'scrapePage', (args, done) => {
      done(null, results);
    });

    scrapePageBySourceId({
      options: mocks.options,
      pageNumber: mocks.pageNumber,
      sourceId: mocks.source.id
    }, cb);

    expect(getSourceById).to.have.been.calledOnce;
    expect(ensureFolderPath).to.have.been.calledOnce;
    expect(scrapePage).to.have.been.calledOnce;
    expect(cb).to.have.been.calledWith(null, results);
  }));
});
