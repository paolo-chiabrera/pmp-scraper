import _ from 'lodash';
import Joi from 'joi';
import async from 'async';

import PmpSource from 'pmp-source';

import main from './main';

import validators from './validators';

/**
* [scrapePageBySourceId description]
* @param  {Object}
* @param  {Function}
*/
export default function scrapePageBySourceId(args, done = _.noop) {
  const schema = Joi.object().keys({
    options: validators.options,
    pageNumber: validators.pageNumber.required(),
    sourceId: validators.sourceId
  }).required();

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
      }
    }, (err, results) => {
      if (err) {
        done(err);
        return;
      }

      main.scrapePage({
        options: val.options,
        pageNumber: val.pageNumber,
        source: results.getSourceById.source
      }, done);
    });
  });
}
