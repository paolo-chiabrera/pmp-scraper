#!/usr/bin/env node --harmony

const program = require('commander');

const pack = require('../package');

const PmpScraper = require('../dist/index');

const PMP_API_URL = 'http://api.dev.picmeplease.eu';

program
  .version(pack.version)
  .option('-s, --source [id]', 'SourceId')
  .option('-p, --page [number]', 'PageNumber')
  .option('-u, --pmp-api-url [url]', 'PmpApiUrl')
  .option('-d, --deep', 'Deep')
  .parse(process.argv);

if (program.source) {
  const pmpApiUrl = program.pmpApiUrl || PMP_API_URL;

  if (program.deep) {
    console.log(`Scraping [${program.source}], deep [${program.deep}], pmpApiUrl [${pmpApiUrl}]`);

    PmpScraper.scrapeDeep({
      options: {
        pmpApiUrl,
        request: {}
      },
      onScrapePage: (err, res) => {
        console.log(err, res);
      },
      sourceId: program.source
    }, (err, results) => {
      if (err) {
        console.error(err);
        process.exit(1);
        return;
      }

      console.log('results', results);

      process.exit();
    });
    return;
  }

  if (program.page) {
    console.log(`Scraping [${program.source}], page [${program.page}], pmpApiUrl [${pmpApiUrl}]`);

    PmpScraper.scrapePageBySourceId({
      options: {
        pmpApiUrl,
        request: {}
      },
      sourceId: program.source,
      pageNumber: parseInt(program.page)
    }, (err, results) => {
      if (err) {
        console.error(err);
        process.exit(1);
        return;
      }

      console.log('results', results);

      process.exit();
    });
  }
}
