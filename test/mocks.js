export default {
  pageNumber: 0,
  targetUrl: 'http://fakesource/page/0',
  scrapedUrls: ['http://fakesource/image0.jpg', 'http://fakesource/image1.png', 'http://fakesource/image2.gif'],
  filteredLinks: ['http://fakesource/image0.jpg', 'http://fakesource/image1.png'],
  filteredDuplicates: ['http://fakesource/image0.jpg'],
  savedImages: [{filename: 'image0.jpg', url: 'http://fakesource/image0.jpg'}],
  source: {
    id: 'fakesource',
    url: 'http://fakesource/page/{{offset}}',
    offset: 10,
    startingOffset: 0,
    mainPageSelector: 'a.link',
    mainPageAttribute: 'href',
    imagePageSelector: 'img.image',
    imagePageAttribute: 'src',
    threshold: 0.75
  },
  options: {
    pmpApiUrl: 'http://api.picmeplease.eu',
    scraperApiUrl: 'http://api.scraper.d3lirium.eu',
    folderPath: './test-images',
    concurrency: 1,
    statsInterval: 10,
    request: {
      json: true,
      headers: {}
    }
  },
  retryInterval: 1,
  report: {
    execTime: 100,
    targetUrl: 'http://fakesource/page/0',
    numScrapedImages: 1,
    numFilteredImages: 1,
    numSavedImages: 1,
    threshold: 1
  },
  reindex: {
    ffffound: 10,
    piccsy: 10
  }
};
