const expect = require('chai').expect;
const co = require('co');
const SearchEngine = require('../../controllers/search_engine').SearchEngine;
const config = require('../test_config');

describe('Search Engine class', function () {

  it('should find elements for given url (level1)', done => {
    const search = new SearchEngine(1);

    co(search.SearchDomByUrl(config.TEST_URL, config.TEST_ELEMENT))
      .then(res => {
        expect(res).to.equal(config.search_results.level1);
        done();
      })
      .catch(err => {
        done(err);
      });
  }).timeout(5000);

  it('should find elements for given url (level2)', done => {
    const search = new SearchEngine(2);

    co(search.SearchDomByUrl(config.TEST_URL, config.TEST_ELEMENT))
      .then(res => {
        expect(res).to.equal(config.search_results.level2);
        done();
      })
      .catch(err => {
        done(err);
      });
  }).timeout(10000);

  it('should erise error for not existing URL', done => {
    const search = new SearchEngine(1);

    co(search.SearchDomByUrl(config.TEST_URL_INCORRECT, config.TEST_ELEMENT))
      .then(() => {
        done(new Error('Error was expected'));
      })
      .catch(err => {
        expect(err.message).to.equal(config.search_results.error_not_found);
        done();
      });
  }).timeout(5000);

});
