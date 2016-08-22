import Joi from 'joi';
import async from 'async';
import _ from 'lodash';

import PmpImage from 'pmp-image';

import validators from './validators';

/**
* [saveImages description]
* @param  {Object}
* @param  {Function}
*/
export default function saveImages(args, done) {
  const schema = Joi.object().required().keys({
    links: validators.links,
    source: validators.source,
    options: validators.options,
    logger: validators.logger
  });

  schema.validate(args, (err, val) => {
    if (err) {
      done(err);
      return;
    }

    const pmpImage = new PmpImage(val.source, {
      folderPath: val.options.folderPath,
      request: _.omit(val.options.request, 'timeout')
    });

    const images = [];

    async.eachLimit(val.links, val.options.concurrency, (link, next) => {
      pmpImage.save({
        url: link
      }, (err, image) => {
        if (err) {
          val.logger.log('warn', 'pmpImage.save', err.message, link);
        }

        if (_.isObject(image)) {
          images.push(_.pick(image, ['filename', 'url']));
        }

        next(null);
      });
    }, err => {
      if (err) {
        done(err);
        return;
      }

      done(null, {
        images: images
      });
    });
  });
}
