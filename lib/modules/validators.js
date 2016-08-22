import Joi from 'joi';

export default {
  source: Joi.object().required().keys({
    id: Joi.string().required(),
    url: Joi.string().required(),
    offset: Joi.number().required(),
    startingOffset: Joi.number().required(),
    mainPageSelector: Joi.string().required(),
    mainPageAttribute: Joi.string().required(),
    imagePageSelector: Joi.string().required(),
    imagePageAttribute: Joi.string().required()
  }),
  options: Joi.object().required().keys({
    pmpApiUrl: Joi.string().required(),
    scraperApiUrl: Joi.string().required(),
    folderPath: Joi.string().required(),
    concurrency: Joi.number().min(1).required(),
    threshold: Joi.number().min(0).max(1).default(0.75).required(),
    statsInterval: Joi.number().min(1).max(100).default(0.75).optional(),
    request: Joi.object().required().keys({
      json: Joi.boolean().required(),
      timeout: Joi.number().optional(),
      headers: Joi.object().optional()
    })
  }),
  links: Joi.array().min(1).required(),
  pageNumber: Joi.number().required(),
  images: Joi.array().items(Joi.object()).min(1).required(),
  retryInterval: Joi.number().min(1).default(200).optional(),
  report: Joi.object().required().keys({
    execTime: Joi.number().required(),
    targetUrl: Joi.string().required(),
    numScrapedImages: Joi.number().required(),
    numFilteredImages: Joi.number().required(),
    numSavedImages: Joi.number().required(),
    threshold: Joi.number().required()
  }),
  logger: Joi.object().default(console).optional()
};
