import {expect} from 'chai';

import pmpScraper from '../lib/index';

describe('pmp-scraper', function () {
  it('should expose the methods', function () {
    expect(pmpScraper.scrapePage).to.be.a('function');
    expect(pmpScraper.scrapePageBySourceId).to.be.a('function');
    expect(pmpScraper.scrapeSourceById).to.be.a('function');
  });
});
