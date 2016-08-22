import Joi from 'joi';

import validators from './validators';

/**
* [getPageUrl description]
* @param  {Object}
* @param  {Function}
*/
export default function getPageUrl(args, done) {
  const schema = Joi.object().required().keys({
    pageNumber: validators.pageNumber,
    source: validators.source
  });

  schema.validate(args, (err, val) => {
    if (err) {
      done(err);
      return;
    }

    const offset = val.source.startingOffset + val.source.offset * val.pageNumber;

    done(null, {
      url: val.source.url.replace('{{offset}}', offset)
    });
  });
}
