import Joi from 'joi';
import needle from 'needle';
import _ from 'lodash';
import async from 'async';

import validators from './validators';

/**
* [filterDuplicates description]
* @param  {Object}
* @param  {Function}
*/
export default function filterDuplicates(args, done) {
  const schema = Joi.object().required().keys({
    options: validators.options,
    links: validators.links,
    retryInterval: validators.retryInterval
  });

  schema.validate(args, (err, val) => {
    if (err) {
      done(err);
      return;
    }

    const url = val.options.pmpApiUrl + '/images/existing';

    const payload = {
      imageUrl: val.links
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
          next(new Error('wrong statusCode ' + res.statusCode));
          return;
        }

        // filter the duplicates
        const links = _.difference(val.links, _.map(res.body, 'imageUrl'));

        next(null, {
          links: links
        });
      });
    }, done);
  });
}
