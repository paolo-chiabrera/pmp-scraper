import _ from 'lodash';
import needle from 'needle';
import Joi from 'joi';
import async from 'async';

import EventEmitter from 'events';

import main from './modules/main';

import validators from './modules/validators';

export default class PmpScraper extends EventEmitter {
  constructor(options) {
    super();

    this.source = null;

    this.pageNumber = 0;

    this.stats = new main.statsCollector();

    this.options = {
      pmpApiUrl: 'http://api.picmeplease.eu',
      scraperApiUrl: 'http://api.scraper.d3lirium.eu',
      folderPath: './images',
      concurrency: 4,
      statsInterval: 5,
      request: {
        timeout: 20000,
        json: true,
        headers: {}
      }
    }

    this.options = _.merge(this.options, options);
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
          main.saveImages.call(this, {
            links: results.filterDuplicates.links,
            sourceId: val.source.id,
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
        }],
        updateStats: ['generateReport', (results, next) => {
          this.stats.updateStats({
            report: results.generateReport.report,
            pageNumber: val.pageNumber
          }, next);
        }]
      }, (err, results) => {
        if (err) {
          done(err);
          return;
        }

        this.emit('report', {
          id: val.pageNumber,
          data: results.generateReport.report
        });

        if(val.pageNumber % this.options.statsInterval == 0) {
          this.emit('stats', {
            id: val.pageNumber,
            data: this.stats.getStats(true)
          });
        }

        done(null, results.generateReport.report);
      });
    });
  }

  scrapePageForever(args, done) {
    const schema = Joi.object().required().keys({
      source: validators.source
    });

    schema.validate(args, (err, val) => {
      if (err) {
        done(err);
        return;
      }

      this.pageNumber = 0;

      this.emit('scrape-start', {
        source: val.source.id,
        pageNumber: this.pageNumber,
        options: this.options
      });

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

          if (res.threshold < val.source.threshold) {
            thresholdMessage = 'threshold not reached: ' + res.threshold;
            next(new Error(thresholdMessage));
            return;
          }

          this.pageNumber++;
          next(null);
        });
      }, err => {

        this.emit('scrape-error', err);

        if (_.isString(thresholdMessage)) {
          this.emit('scrape-end', {
            source: val.source.id,
            pageNumber: this.pageNumber,
            stats: this.stats.getStats(true)
          });

          this.reindexImages();
        }

        done(null, this.stats);
      });
    });
  }

  reindexImages() {
    this.emit('reindex-start');

    main.reindexImages({
      options: this.options
    }, (err, res) => {
      if (err) {
        this.emit('reindex-error', err);
        return;
      }

      this.emit('reindex-end', res);
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

      main.ensureFolderPath({
        folderPath: this.options.folderPath
      }, err => {
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

        this.scrapePageForever({
          source: val.source
        }, done);
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

      const url = this.options.pmpApiUrl + '/sources/' + val.sourceId;

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
