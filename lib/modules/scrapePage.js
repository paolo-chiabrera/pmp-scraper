import _ from 'lodash';
import Joi from 'joi';
import async from 'async';

import PmpPage from 'pmp-page';
import PmpImage from 'pmp-image';

import main from './main';

import validators from './validators';

/**
* [scrapePage description]
* @param  {Object}
* @param  {Function}
*/
export default function scrapePage(args, done = _.noop) {
  const schema = Joi.object().required().keys({
    options: validators.options,
    pageNumber: validators.pageNumber.required(),
    source: validators.source
  });

  schema.validate(args, (err, val) => {
    if (err) {
      done(err);
      return;
    }

    const START_TIME = Date.now();

    async.auto({
      scrapePage: (next) => {
        PmpPage.scrape({
          pageNumber: val.pageNumber,
          options: _.pick(val.options, ['pmpApiUrl', 'scraperApiUrl', 'request']),
          source: val.source
        }, next);
      },
      saveImages: ['scrapePage', (results, next) => {
        PmpImage.saveBatch({
          links: results.scrapePage.links,
          options: _.omit(val.options, ['scraperApiUrl']),
          sourceId: val.source.id
        }, next);
      }],
      generateReport: ['saveImages', (results, next) => {
        main.generateReport({
          targetUrl: results.scrapePage.pageUrl,
          scrapedLinks: results.scrapePage.links,
          threshold: results.scrapePage.threshold,
          savedImages: results.saveImages.images,
          startTime: START_TIME
        }, next);
      }]
    }, (err, results) => {
      if (err) {
        done(err);
        return;
      }

      done(null, {
        errors: results.saveImages.errors,
        pageNumber: val.pageNumber,
        report: results.generateReport.report
      });
    });
  });
}
