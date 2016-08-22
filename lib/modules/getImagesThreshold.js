import Joi from 'joi';

/**
* [getImagesThreshold description]
* @param  {Object}
* @param  {Function}
*/
export default function getImagesThreshold(args, done) {

  const schema = Joi.object().required().keys({
    scrapedImages: Joi.array().required(),
    validImages: Joi.array().required()
  });

  schema.validate(args, (err, val) => {
    if (err) {
      done(err);
      return;
    }

    done(null, {
      threshold: val.validImages.length / val.scrapedImages.length
    });
  });
}
