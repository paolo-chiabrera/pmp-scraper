import {expect} from 'chai';
import sinon from 'sinon';
import _ from 'lodash';

import StatsCollector from '../../lib/modules/statsCollector';

import mocks from '../mocks';

describe('StatsCollector', function () {
  let statsCollector;

  beforeEach(function () {
    statsCollector = new StatsCollector();
  });

  it('should be defined', function () {
    expect(statsCollector).to.be.an('object');
  });

  describe('constructor', function () {
    it('should set all the properties', function () {
      expect(statsCollector.pageNumber).to.be.a('number');

      expect(statsCollector.stats).to.be.an('object');

      expect(statsCollector.stats.process).to.be.an('object');
      expect(statsCollector.stats.process.pid).to.be.a('number');
      expect(statsCollector.stats.process.arch).to.be.a('string');
      expect(statsCollector.stats.process.platform).to.be.a('string');

      expect(statsCollector.stats.memory).to.be.an('object');
      expect(statsCollector.stats.memory._tot).to.be.a('number');
      expect(statsCollector.stats.memory.average).to.be.a('number');
      expect(statsCollector.stats.memory.highest).to.be.a('number');
      expect(statsCollector.stats.memory.lowest).to.be.a('number');

      expect(statsCollector.stats.execTime).to.be.an('object');
      expect(statsCollector.stats.execTime.total).to.be.a('number');
      expect(statsCollector.stats.execTime.average).to.be.a('number');
      expect(statsCollector.stats.execTime.highest).to.be.a('number');
      expect(statsCollector.stats.execTime.lowest).to.be.a('number');

      expect(statsCollector.stats.threshold).to.be.an('object');
      expect(statsCollector.stats.threshold._tot).to.be.a('number');
      expect(statsCollector.stats.threshold.average).to.be.a('number');
      expect(statsCollector.stats.threshold.highest).to.be.a('number');
      expect(statsCollector.stats.threshold.lowest).to.be.a('number');

      expect(statsCollector.stats.numScrapedImages).to.be.a('number');
      expect(statsCollector.stats.numFilteredImages).to.be.a('number');
      expect(statsCollector.stats.numSavedImages).to.be.a('number');
    });
  });

  describe('getStats', function () {
    it('should be defined', function () {
      expect(statsCollector.getStats).to.be.a('function');
    });

    it('should return the stats', function () {
      expect(statsCollector.getStats()).to.eql(statsCollector.stats);
    });
  });

  describe('updateStats', function () {

    let report;

    beforeEach(function () {
      report = _.clone(mocks.report);
    });

    it('should be defined', function () {
      expect(statsCollector.updateStats).to.be.a('function');
    });

    it('should return an error: validation', sinon.test(function (done) {
      const cb = this.spy(err => {
        expect(err).to.be.an('error');
        done();
      });

      statsCollector.updateStats({}, cb);
    }));

    it('should update the highest/lowest/_tot threshold', sinon.test(function (done) {
      const cb = this.spy((err, res) => {
        expect(res.stats.threshold.highest).to.equal(0.8);
        expect(res.stats.threshold.lowest).to.equal(0.8);
        expect(res.stats.threshold._tot).to.equal(0.8);

        done();
      });

      report.threshold = 0.8;

      statsCollector.updateStats({
        pageNumber: 0,
        report: report
      }, cb);
    }));

    it('should update the threshold', sinon.test(function (done) {
      const cb = this.spy((err, res) => {
        expect(res.stats.threshold.highest).to.equal(0.8);
        expect(res.stats.threshold.lowest).to.equal(0.2);
        expect(res.stats.threshold._tot).to.equal(1);
        expect(res.stats.threshold.average).to.equal(0.5);

        done();
      });

      report.threshold = 0.8;

      statsCollector.updateStats({
        pageNumber: 0,
        report: report
      }, () => {
        report.threshold = 0.2;
        statsCollector.updateStats({
          pageNumber: 1,
          report: report
        }, cb);
      });
    }));

    it('should update the execTime', sinon.test(function (done) {
      const cb = this.spy((err, res) => {
        expect(res.stats.execTime.highest).to.equal(10);
        expect(res.stats.execTime.lowest).to.equal(4);
        expect(res.stats.execTime.total).to.equal(14);
        expect(res.stats.execTime.average).to.equal(7);

        done();
      });

      report.execTime = 10;

      statsCollector.updateStats({
        pageNumber: 0,
        report: report
      }, () => {
        report.execTime = 4;
        statsCollector.updateStats({
          pageNumber: 1,
          report: report
        }, cb);
      });
    }));
  });
});
