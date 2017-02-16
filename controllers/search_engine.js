const got = require('got');
const cheerio = require('cheerio');
const log = require('../log');

class SearchEngine {

  constructor(levelMax) {
    this.levelMax = levelMax;
    this.result = '';
    this.AllUrls = new Set();
  }

  *SearchDomByUrl(url_str, element, levelCurrent = 1) {
    log.info(`=== level: ${levelCurrent} (max ${this.levelMax}), element: ${element}, search url: ${url_str}`);
    let $;

    if (levelCurrent <= this.levelMax) {
      const html = yield got(url_str);
      $ = cheerio.load(html.body, {normalizeWhitespace: false, xmlMode: false, decodeEntities: true});
      this.getElements($, element);
    }

    if (levelCurrent < this.levelMax) {
      const urls = this.getUrls($);
      for (let i = 0; i < urls.length; i++) {
        yield* this.SearchDomByUrl(urls[i], element, levelCurrent + 1);
      }
    }
    return this.result.replace(/,\s*$/, '');
  }

  getElements($, element) {
    $(element).each((i, el) => {
      let foundEl = $(el).html().toString();
      foundEl = foundEl.replace(/[\n\r]/g, '').replace(/\s+/g, ' ');
      this.result += `[${foundEl}], `;
      log.verbose('--- found tag: ', foundEl);
    });
  }

  getUrls($) {
    const urls = [];
    const links = $('a');

    links.each((i, link) => {
      let linkFiltered = $(link).attr('href');
      if (typeof linkFiltered !== 'undefined') {
        linkFiltered = linkFiltered.replace('/url?q=', '').split('&')[0];
        if (linkFiltered.toLowerCase().startsWith('http') && !this.AllUrls.has(linkFiltered)) {
          this.AllUrls.add(linkFiltered);
          urls.push(linkFiltered);
        }
      }
    });
    log.verbose('--- urls = ', urls);
    return urls;
  }
}

module.exports = {
  SearchEngine
};