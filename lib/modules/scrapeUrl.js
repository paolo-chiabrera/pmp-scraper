import Joi from 'joi';
import needle from 'needle';
import async from 'async';

import validators from './validators';

/**
* [scrapeUrl description]
* @param  {Object}
* @param  {Function}
*/
export default function scrapeUrl(args, done) {
  const schema = Joi.object().required().keys({
    source: validators.source,
    options: validators.options,
    targetUrl: Joi.string().required(),
    retryInterval: validators.retryInterval
  });

  schema.validate(args, (err, val) => {
    if (err) {
      done(err);
      return;
    }

    const url = val.options.scraperApiUrl + '/scrape';

    const payload = {
      url: val.targetUrl,
      selectors: {
        page: val.source.mainPageSelector + '@' + val.source.mainPageAttribute,
        image: val.source.imagePageSelector + '@' + val.source.imagePageAttribute
      }
    };

    async.retry({
      times: 3,
      interval: val.retryInterval
    }, next => {
      needle.post(url, payload, val.options.request, (err, res) => {
        if (err) {
          next(err);
          return;
        }

        if (res.statusCode !== 200) {
          next(new Error('wrong statusCode ' + res.statusCode + ' ' + res.statusMessage));
          return;
        }

        next(null, res.body);
      });
    }, done);
  });
}
