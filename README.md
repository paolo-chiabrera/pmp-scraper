# pmp-scraper [![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Dependency Status][daviddm-image]][daviddm-url] [![Coverage percentage][coveralls-image]][coveralls-url]
> PicMePlease Scraper API

## Installation

```sh
$ npm install --save pmp-scraper
```

## Usage

```js
var PmpScraper = require('pmp-scraper');

var pmpScraper = new PMPScraper(options);

pmpScraper.scrape({
  source: source
}, (err, res) => {
  /* do something */
});
```
## License

MIT © [Paolo Chiabrera](https://github.com/paolo-chiabrera)


[npm-image]: https://badge.fury.io/js/pmp-scraper.svg
[npm-url]: https://npmjs.org/package/pmp-scraper
[travis-image]: https://travis-ci.org/paolo-chiabrera/pmp-scraper.svg?branch=master
[travis-url]: https://travis-ci.org/paolo-chiabrera/pmp-scraper
[daviddm-image]: https://david-dm.org/paolo-chiabrera/pmp-scraper.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/paolo-chiabrera/pmp-scraper
[coveralls-image]: https://coveralls.io/repos/paolo-chiabrera/pmp-scraper/badge.svg
[coveralls-url]: https://coveralls.io/r/paolo-chiabrera/pmp-scraper
