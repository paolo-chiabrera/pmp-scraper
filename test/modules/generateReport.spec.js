import {expect} from 'chai';
import sinon from 'sinon';

import generateReport from '../../lib/modules/generateReport';

import mocks from '../mocks';

describe('generateReport', function () {
  it('should be defined', function () {
    expect(generateReport).to.be.a('function');
  });

  it('should return an error: validation', sinon.test(function (done) {
    const cb = this.spy(err => {
      expect(err).to.be.an('error');
      done();
    });

    generateReport({}, cb);
  }));

  it('should return a report', sinon.test(function (done) {
    const cb = this.spy((err, res) => {
      expect(err).to.be.a('null');
      expect(res).to.be.an('object');
      expect(res.report).to.be.an('object');

      done();
    });

    generateReport({
      targetUrl: mocks.targetUrl,
      scrapedLinks: mocks.scrapedUrls,
      validLinks: mocks.filteredDuplicates,
      threshold: 1,
      savedImages: mocks.savedImages,
      startTime: Date.now()
    }, cb);
  }));
});
