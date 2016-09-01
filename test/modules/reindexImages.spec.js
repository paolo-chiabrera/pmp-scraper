import {expect} from 'chai';
import sinon from 'sinon';

import needle from 'needle';

import reindexImages from '../../lib/modules/reindexImages';

import mocks from '../mocks';

describe('reindexImages', function () {
  it('should be defined', function () {
    expect(reindexImages).to.be.a('function');
  });

  it('should return an error: validation', sinon.test(function (done) {
    const cb = this.spy(err => {
      expect(err).to.be.an('error');
      done();
    });

    reindexImages({}, cb);
  }));

  it('should return an error: needle.post', sinon.test(function (done) {
    const fakeError = new Error('error');
    const needlePost = this.stub(needle, 'post', (url, options, callback) => {
      callback(fakeError);
    });

    const cb = this.spy(err => {
      sinon.assert.calledOnce(needlePost);
      expect(err).to.eql(fakeError);

      needlePost.restore();
      done();
    });

    reindexImages({
      options: mocks.options
    }, cb);
  }));

  it('should return an error: statusCode', sinon.test(function (done) {
    const statusCode = 401;
    const statusError = new Error('wrong statusCode ' + statusCode);
    const needlePost = this.stub(needle, 'post', (url, options, callback) => {
      callback(null, {
        statusCode: statusCode
      });
    });

    const cb = this.spy(err => {
      sinon.assert.calledOnce(needlePost);
      expect(err).to.eql(statusError);

      needlePost.restore();
      done();
    });

    reindexImages({
      options: mocks.options
    }, cb);
  }));

  it('should return the reindex counters', sinon.test(function (done) {
    const needlePost = this.stub(needle, 'post', (url, options, callback) => {
      callback(null, {
        statusCode: 200,
        body: mocks.reindex
      });
    });

    const cb = this.spy((err, res) => {
      sinon.assert.calledOnce(needlePost);
      expect(err).to.be.a('null');
      expect(res).to.eql(mocks.reindex);

      needlePost.restore();
      done();
    });

    reindexImages({
      options: mocks.options
    }, cb);
  }));
});
