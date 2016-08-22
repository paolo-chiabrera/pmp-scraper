import Joi from 'joi';
import _ from 'lodash';
import process from 'process';
import prettyBytes from 'pretty-bytes';

import validators from './validators';

export default class StatsCollector {
  constructor() {
    this.pageNumber = 0;

    this.stats = {
      process: {
        pid: process.pid,
        platform: process.platform,
        arch: process.arch
      },
      memory: {
        _tot: 0,
        average: 0,
        lowest: 99999,
        highest: 0,
        current: 0
      },
      execTime: {
        total: 0,
        average: 0,
        lowest: 99999,
        highest: 0,
        current: 0
      },
      threshold: {
        _tot: 0,
        average: 0,
        lowest: 1,
        highest: 0,
        current: 0
      },
      numScrapedImages: 0,
      numFilteredImages: 0,
      numSavedImages: 0,
      percSavedImages: 0
    }
  }

  getStats(pretty = false) {
    if (!pretty) {
      return this.stats;
    }

    return {
      process: this.stats.process,
      execTime: this.stats.execTime,
      numScrapedImages: this.stats.numScrapedImages,
      numFilteredImages: this.stats.numFilteredImages,
      numSavedImages: this.stats.numSavedImages,
      percSavedImages: this.stats.percSavedImages,
      threshold: _.omit(this.stats.threshold, '_tot'),
      memory: _.chain(this.stats.memory).omit('_tot').mapValues(val => prettyBytes(val)).value()
    };
  }

  updateStats(args, done) {
    const schema = Joi.object().required().keys({
      report: validators.report,
      pageNumber: validators.pageNumber
    });

    schema.validate(args, (err, val) => {
      if (err) {
        done(err);
        return;
      }

      this.pageNumber = val.pageNumber;

      // counts
      this.stats.numScrapedImages += val.report.numScrapedImages;
      this.stats.numFilteredImages += val.report.numFilteredImages;
      this.stats.numSavedImages += val.report.numSavedImages;
      this.stats.percSavedImages = this.stats.numSavedImages / this.stats.numScrapedImages;

      // threshold
      this.stats.threshold.current = val.report.threshold;
      this.stats.threshold._tot += val.report.threshold;
      if (val.report.threshold > this.stats.threshold.highest) this.stats.threshold.highest = val.report.threshold;
      if (val.report.threshold < this.stats.threshold.lowest) this.stats.threshold.lowest = val.report.threshold;
      this.stats.threshold.average = this.stats.threshold._tot / (this.pageNumber+1);

      // execTime
      this.stats.execTime.current = val.report.execTime;
      this.stats.execTime.total += val.report.execTime;
      if (val.report.execTime > this.stats.execTime.highest) this.stats.execTime.highest = val.report.execTime;
      if (val.report.execTime < this.stats.execTime.lowest) this.stats.execTime.lowest = val.report.execTime;
      this.stats.execTime.average = this.stats.execTime.total / (this.pageNumber+1);

      // process
      const mem = parseInt(process.memoryUsage().rss);
      this.stats.memory.current = mem;
      this.stats.memory._tot += mem;
      if (mem > this.stats.memory.highest) this.stats.memory.highest = mem;
      if (mem < this.stats.memory.lowest) this.stats.memory.lowest = mem;
      this.stats.memory.average = Math.floor(this.stats.memory._tot / (this.pageNumber+1));

      done(null, {
        stats: this.stats
      });
    });
  }
}
