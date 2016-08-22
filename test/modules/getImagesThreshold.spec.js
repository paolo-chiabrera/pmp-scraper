import {expect} from 'chai';
import sinon from 'sinon';

import getImagesThreshold from '../../lib/modules/getImagesThreshold';

import mocks from '../mocks';

describe('getImagesThreshold', function () {
  it('should be defined', function () {
    expect(getImagesThreshold).to.be.a('function');
  });

  it('should return an error: validation', sinon.test(function (done) {
    const cb = this.spy(err => {
      expect(err).to.be.an('error');
      done();
    });

    getImagesThreshold({}, cb);
  }));

  it('should return a valid threshold', sinon.test(function (done) {
    const cb = this.spy((err, res) => {
      expect(err).to.be.a('null');
      expect(res).to.be.an('object');
      expect(res.threshold).to.equal(1);

      done();
    });

    getImagesThreshold({
      scrapedImages: mocks.scrapedUrls,
      validImages: mocks.scrapedUrls
    }, cb);
  }));
});
