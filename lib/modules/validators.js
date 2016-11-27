import Joi from 'joi';

export default {
  sourceId: Joi.string().required(),
  source: Joi.object().required().keys({
    _id: Joi.string().optional(),
    id: Joi.string().required(),
    url: Joi.string().required(),
    offset: Joi.number().required(),
    startingOffset: Joi.number().required(),
    mainPageSelector: Joi.string().required(),
    mainPageAttribute: Joi.string().required(),
    imagePageSelector: Joi.string().required(),
    imagePageAttribute: Joi.string().required(),
    threshold: Joi.number().min(0).max(1).default(0.75).required(),
    schedule: Joi.string().required(),
    active: Joi.boolean().required()
  }),
  options: Joi.object().keys({
    pmpApiUrl: Joi.string().default('http://api.dev.picmeplease.eu'),
    scraperApiUrl: Joi.string().default('http://api.scraper.d3lirium.eu'),
    folderPath: Joi.string().default('./images').optional(),
    concurrency: Joi.number().min(1).default(2).optional(),
    request: Joi.object().keys({
      json: Joi.boolean().default(true).optional(),
      timeout: Joi.number().optional(),
      headers: Joi.object().default({}).optional()
    })
  }),
  links: Joi.array().min(1).required(),
  pageNumber: Joi.number().default(0),
  images: Joi.array().items(Joi.object()).required(),
  retryInterval: Joi.number().min(1).default(200).optional(),
  report: Joi.object().required().keys({
    execTime: Joi.number().required(),
    targetUrl: Joi.string().required(),
    numScrapedImages: Joi.number().required(),
    numFilteredImages: Joi.number().required(),
    numSavedImages: Joi.number().required(),
    threshold: Joi.number().required()
  })
};
