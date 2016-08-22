import {expect} from 'chai';
import sinon from 'sinon';

import getPageUrl from '../../lib/modules/getPageUrl';

import mocks from '../mocks';

describe('getPageUrl', function () {
  it('should be defined', function () {
    expect(getPageUrl).to.be.a('function');
  });

  it('should return an error: validation', sinon.test(function (done) {
    const cb = this.spy(err => {
      expect(err).to.be.an('error');
      done();
    });

    getPageUrl({}, cb);
  }));

  it('should return the pageUrl', sinon.test(function (done) {
    const cb = this.spy((err, res) => {
      expect(res).to.be.an('object');
      expect(res.url).to.equal('http://fakesource/page/0');

      done(err);
    });

    getPageUrl({
      pageNumber: mocks.pageNumber,
      source: mocks.source
    }, cb);
  }));
});
