import Joi from 'joi';

import validators from './validators';

/**
* [generateReport description]
* @param  {Object}
* @param  {Function}
*/
export default function generateReport(args, done) {
  const schema = Joi.object().required().keys({
    targetUrl: Joi.string().required(),
    scrapedLinks: validators.links,
    threshold: Joi.number().required(),
    savedImages: validators.images,
    startTime: Joi.number().required()
  });

  schema.validate(args, (err, val) => {
    if (err) {
      done(err);
      return;
    }

    const report = {
      execTime: (Date.now() - val.startTime) / 1000,
      targetUrl: val.targetUrl,
      numScrapedImages: val.scrapedLinks.length,
      numSavedImages: val.savedImages.length,
      threshold: val.threshold
    };

    done(null, {
      report: report
    });
  });
}
