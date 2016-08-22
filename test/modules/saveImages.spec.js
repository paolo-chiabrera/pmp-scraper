import {expect} from 'chai';
import sinon from 'sinon';

import async from 'async';
import _ from 'lodash';

import saveImages from '../../lib/modules/saveImages';

import PmpImage from 'pmp-image';

import mocks from '../mocks';

describe('saveImages', function () {
  it('should be defined', function () {
    expect(saveImages).to.be.a('function');
  });

  it('should return an error: validation', sinon.test(function (done) {
    const cb = this.spy(err => {
      expect(err).to.be.an('error');
      done();
    });

    saveImages({}, cb);
  }));

  it('should log an error: PmpImage.save', sinon.test(function (done) {
    const fakeError = new Error('message');
    const save = this.stub(PmpImage.prototype, 'save', (args, callback) => {
      callback(fakeError);
    });
    const log = this.spy((level, label, message) => {
      expect(level).to.equal('warn');
      expect(label).to.equal('pmpImage.save');
      expect(message).to.equal(message);
    });
    const cb = this.spy(err => {
      expect(err).to.be.a('null');
      sinon.assert.calledOnce(save);
      sinon.assert.calledOnce(log);

      save.restore();
      done();
    });

    saveImages({
      links: mocks.filteredDuplicates,
      source: mocks.source,
      options: mocks.options,
      logger: {
        log: log
      }
    }, cb);
  }));

  it('should return an error: async.eachLimit', sinon.test(function (done) {
    const fakeError = new Error('fakeError');
    const eachLimit = this.stub(async, 'eachLimit', (args, concurrency, worker, callback) => {
      callback(fakeError);
    });
    const save = this.stub(PmpImage.prototype, 'save', (args, callback) => {
      callback(null);
    });
    const cb = this.spy(err => {
      expect(err).to.eql(fakeError);
      sinon.assert.calledOnce(eachLimit);
      sinon.assert.notCalled(save);

      eachLimit.restore();
      save.restore();
      done();
    });

    saveImages({
      links: mocks.filteredDuplicates,
      source: mocks.source,
      options: mocks.options
    }, cb);
  }));

  it('should return an array of images', sinon.test(function (done) {
    const save = this.stub(PmpImage.prototype, 'save', (args, callback) => {
      callback(null, mocks.savedImages[0]);
    });
    const pick = this.spy(_, 'pick');
    const cb = this.spy((err, res) => {
      expect(err).to.be.a('null');
      expect(res).to.be.an('object');
      expect(res.images).to.be.an('array');
      sinon.assert.calledOnce(save);
      sinon.assert.calledOnce(pick);

      save.restore();
      pick.restore();
      done();
    });

    saveImages({
      links: mocks.filteredDuplicates,
      source: mocks.source,
      options: mocks.options
    }, cb);
  }));
});
