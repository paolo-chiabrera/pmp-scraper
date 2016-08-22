import {expect} from 'chai';
import sinon from 'sinon';

import needle from 'needle';

import filterDuplicates from '../../lib/modules/filterDuplicates';

import mocks from '../mocks';

describe('filterDuplicates', function () {
  it('should be defined', function () {
    expect(filterDuplicates).to.be.a('function');
  });

  it('should return an error: validation', sinon.test(function (done) {
    const cb = this.spy(err => {
      expect(err).to.be.an('error');
      done();
    });

    filterDuplicates({}, cb);
  }));

  it('should return an error: needle.post', sinon.test(function (done) {
    const fakeError = new Error('error');
    const needlePost = this.stub(needle, 'post', (url, payload, options, callback) => {
      callback(fakeError);
    });

    const cb = this.spy(err => {
      sinon.assert.calledThrice(needlePost);
      expect(err).to.eql(fakeError);

      needlePost.restore();
      done();
    });

    filterDuplicates({
      options: mocks.options,
      links: mocks.filteredLinks,
      retryInterval: mocks.retryInterval
    }, cb);
  }));

  it('should return an error: statusCode', sinon.test(function (done) {
    const statusCode = 401;
    const statusError = new Error('wrong statusCode ' + statusCode);
    const needlePost = this.stub(needle, 'post', (url, payload, options, callback) => {
      callback(null, {
        statusCode: statusCode
      });
    });

    const cb = this.spy(err => {
      sinon.assert.calledThrice(needlePost);
      expect(err).to.eql(statusError);

      needlePost.restore();
      done();
    });

    filterDuplicates({
      options: mocks.options,
      links: mocks.filteredLinks,
      retryInterval: mocks.retryInterval
    }, cb);
  }));

  it('should return a filtered array of links', sinon.test(function (done) {
    const needlePost = this.stub(needle, 'post', (url, payload, options, callback) => {
      callback(null, {
        statusCode: 200,
        body: [{imageUrl: mocks.filteredLinks[0]}]
      });
    });

    const cb = this.spy((err, res) => {
      sinon.assert.calledOnce(needlePost);
      expect(err).to.be.a('null');
      expect(res).to.be.an('object');
      expect(res.links).to.eql(mocks.filteredLinks.slice(1));

      needlePost.restore();
      done();
    });

    filterDuplicates({
      options: mocks.options,
      links: mocks.filteredLinks,
      retryInterval: mocks.retryInterval
    }, cb);
  }));
});
