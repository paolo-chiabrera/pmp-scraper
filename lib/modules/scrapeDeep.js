import _ from 'lodash';
import Joi from 'joi';
import async from 'async';

import PmpSource from 'pmp-source';

import main from './main';

import validators from './validators';

/**
* [scrapeDeepAux description]
* @param  {Object}
* @param  {Function}
*/
export function scrapeDeepAux(args, done) {
  const { onScrapePage, options, source } = args;
  let pageNumber = 0;

  async.forever(next => {
    main.scrapePage({
      options,
      source,
      pageNumber
    }, (err, res) => {
      onScrapePage(err, res);

      if (err) {
        next(err);
        return;
      }

      if (res.threshold < source.threshold) {
        next({
          threshold: res.threshold
        });
        return;
      }

      pageNumber++;
      next(null);
    });
  }, err => {
    if (_.isNumber(err.threshold)) {
      done(null, {
        pageNumber,
        threshold: err.threshold
      });
      return;
    }

    done(err);
  });
}

/**
* [scrapeDeep description]
* @param  {Object}
* @param  {Function}
*/
export default function scrapeDeep(args, done = _.noop) {
  const schema = Joi.object().required().keys({
    options: validators.options,
    sourceId: validators.sourceId,
    onScrapePage: Joi.func().default(_.noop).optional()
  });

  schema.validate(args, (err, val) => {
    if (err) {
      done(err);
      return;
    }

    async.auto({
      getSourceById: (next) => {
        PmpSource.getSourceById({
          options: _.pick(val.options, ['pmpApiUrl', 'request']),
          sourceId: val.sourceId
        }, next);
      },
      ensureFolderPath: (next) => {
        main.ensureFolderPath({
          folderPath: val.options.folderPath
        }, next);
      },
      scrapeDeep: ['getSourceById', 'ensureFolderPath', (results, next) => {
        scrapeDeepAux({
          onScrapePage: val.onScrapePage,
          options: val.options,
          source: results.getSourceById.source
        }, next);
      }]
    }, (err, results) => {
      if (err) {
        done(err);
        return;
      }

      done(null, results.scrapeDeep);
    });
  });
}
