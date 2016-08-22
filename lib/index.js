import _ from 'lodash';
import needle from 'needle';
import Joi from 'joi';
import async from 'async';
import winston from 'winston';

import main from './modules/main'

import validators from './modules/validators';

export default class PMPScraper {
  constructor(options) {
    this.source = null;

    this.pageNumber = 0;

    this.stats = {
      execTime: {
        total: 0,
        average: 0,
        lowest: 99999,
        highest: 0
      },
      threshold: {
        _tot: 0,
        average: 0,
        lowest: 1,
        highest: 0
      },
      numScrapedImages: 0,
      numFilteredImages: 0,
      numSavedImages: 0
    };

    this.options = {
      pmpApiUrl: 'http://api.picmeplease.eu',
      scraperApiUrl: 'http://api.scraper.d3lirium.eu',
      folderPath: './images',
      concurrency: 4,
      threshold: 0.75,
      statsInterval: 10,
      request: {
        timeout: 20000,
        json: true,
        headers: {}
      }
    }

    this.options = _.merge(this.options, options);
  }

  updateStats(report) {
    this.stats.numScrapedImages += report.numScrapedImages;
    this.stats.numFilteredImages += report.numFilteredImages;
    this.stats.numSavedImages += report.numSavedImages;
    this.stats.percSavedImages = this.stats.numSavedImages / this.stats.numScrapedImages;

    // threshold
    this.stats.threshold._tot += report.threshold;
    if (report.threshold > this.stats.threshold.highest) this.stats.threshold.highest = report.threshold;
    if (report.threshold < this.stats.threshold.lowest) this.stats.threshold.lowest = report.threshold;
    this.stats.threshold.average = this.stats.threshold._tot / (this.pageNumber+1);

    // execTime
    this.stats.execTime.total += report.execTime;
    if (report.execTime > this.stats.execTime.highest) this.stats.execTime.highest = report.execTime;
    if (report.execTime < this.stats.execTime.lowest) this.stats.execTime.lowest = report.execTime;
    this.stats.execTime.average = this.stats.execTime.total / (this.pageNumber+1);
  }

  scrapePage(args, done) {
    const schema = Joi.object().required().keys({
      options: validators.options,
      pageNumber: validators.pageNumber,
      source: validators.source
    });

    schema.validate(args, (err, val) => {
      if (err) {
        done(err);
        return;
      }

      const startTime = Date.now();

      async.auto({
        getPageUrl: (next) => {
          main.getPageUrl({
            source: val.source,
            pageNumber: val.pageNumber
          }, next);
        },
        scrapeUrl: ['getPageUrl', (results, next) => {
          main.scrapeUrl({
            targetUrl: results.getPageUrl.url,
            options: val.options,
            source: val.source
          }, next);
        }],
        filterLinks: ['scrapeUrl', (results, next) => {
          main.filterLinks({
            links: results.scrapeUrl.results
          }, next);
        }],
        filterDuplicates: ['filterLinks', (results, next) => {
          main.filterDuplicates({
            options: val.options,
            links: results.filterLinks.links
          }, next);
        }],
        getImagesThreshold: ['filterDuplicates', (results, next) => {
          main.getImagesThreshold({
            scrapedImages: results.scrapeUrl.results,
            validImages: results.filterDuplicates.links
          }, next);
        }],
        saveImages: ['getImagesThreshold', (results, next) => {
          main.saveImages({
            links: results.filterDuplicates.links,
            source: val.source,
            options: val.options
          }, next);
        }],
        generateReport: ['saveImages', (results, next) => {
          main.generateReport({
            targetUrl: results.getPageUrl.url,
            scrapedLinks: results.scrapeUrl.results,
            validLinks: results.filterDuplicates.links,
            threshold: results.getImagesThreshold.threshold,
            savedImages: results.saveImages.images,
            startTime: startTime
          }, next);
        }]
      }, (err, results) => {
        if (err) {
          done(err);
          return;
        }

        this.updateStats(results.generateReport.report);

        winston.info('report-' + val.pageNumber, results.generateReport.report);

        if (this.pageNumber > 0 && this.pageNumber % this.options.statsInterval === 0) {
          winston.info('stats-' + Math.floor(this.pageNumber / this.options.statsInterval), this.stats);
        }

        done(null, results.generateReport.report);
      });
    });
  }

  scrapeSource(args, done) {
    const schema = Joi.object().required().keys({
      source: validators.source,
      pageNumber: Joi.number().optional()
    });

    schema.validate(args, (err, val) => {
      if (err) {
        done(err);
        return;
      }

      if (_.isNumber(val.pageNumber)) {
        this.scrapePage({
          options: this.options,
          source: val.source,
          pageNumber: val.pageNumber
        }, done);
        return;
      }

      this.pageNumber = 0;

      winston.info('scrapeSource.start', val.source.id, this.pageNumber);

      let thresholdMessage;

      async.forever(next => {
        this.scrapePage({
          options: this.options,
          source: val.source,
          pageNumber: this.pageNumber
        }, (err, res) => {
          if (err) {
            next(err);
            return;
          }

          if (res.threshold < this.options.threshold) {
            thresholdMessage = 'threshold not reached: ' + res.threshold;
            next(new Error(thresholdMessage));
            return;
          }

          this.pageNumber++;
          next(null);
        });
      }, err => {

        winston.error('async.forever', err.message);

        if (_.isString(thresholdMessage)) {
          winston.info('scrapeSource.end', val.source.id, this.pageNumber, this.stats);
        }

        done(null, this.stats);
      });
    });
  }

  getSourceById(args, done) {
    const schema = Joi.object().required().keys({
      sourceId: Joi.string().required()
    });

    schema.validate(args, (err, val) => {
      if (err) {
        done(err);
        return;
      }

      const url = this.options.baseUrl + '/sources/' + val.sourceId;

      needle.get(url, this.options.request, (err, res) => {
        if (err) {
          done(err);
          return;
        }

        if (res.statusCode !== 200) {
          done(new Error('wrong statusCode ' + res.statusCode));
          return;
        }

        if (!_.isObject(res.body) || _.isEmpty(res.body)) {
          done(new Error('source not found: ' + val.sourceId));
          return;
        }

        done(null, res.body)
      });
    });
  }

  scrape(args, done) {
    const schema = Joi.object().required().keys({
      source: Joi.alternatives().try(Joi.object(), Joi.string()).required()
    });

    schema.validate(args, (err, val) => {
      if (err) {
        done(err);
        return;
      }

      if (_.isObject(val.source)) {
        this.scrapeSource({
          source: val.source
        }, done);
        return;
      }

      this.getSourceById({
        sourceId: val.source
      }, (err, source) => {
        if (err) {
          done(err);
          return;
        }

        this.scrapeSource({
          source: source
        }, done);
      });
    });
  }
}
