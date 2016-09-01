import Joi from 'joi';
import needle from 'needle';

import validators from './validators';

/**
* [reindexImages description]
* @param  {Object}
* @param  {Function}
*/
export default function reindexImages(args, done) {
  const schema = Joi.object().required().keys({
    options: validators.options
  });

  schema.validate(args, (err, val) => {
    if (err) {
      done(err);
      return;
    }

    const url = val.options.pmpApiUrl + '/images/reindex';

    needle.post(url, val.options.request, (err, res) => {
      if (err) {
        done(err);
        return;
      }

      if (res.statusCode !== 200) {
        done(new Error('wrong statusCode ' + res.statusCode + ' ' + res.statusMessage));
        return;
      }

      done(null, res.body);
    });
  });
}
