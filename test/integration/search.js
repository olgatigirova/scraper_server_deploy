const expect = require('chai').expect;
const fs = require('fs');
const config = require('../test_config');
const request = require('./test').request;

describe('Search', () => {

  it('get should return 200 if search is successful', done => {
    request
      .get(config.TEST_REQUEST)
      .expect(200)
      .end((err, res) => {
        const result = JSON.parse(res.text);
        expect(result.data).to.equal(config.search_results.level1);
        done();
      });
  }).timeout(5000);

  it('get should return 500 if search request has incorrect url', done => {
    request
      .get(config.TEST_REQUEST_INCORRECT)
      .expect(500)
      .end((err, res) => {
        expect(res.text).to.equal(config.search_results.error_wrong_url);
        done();
      });
  });

  it('post should return 302 if ok', done => {
    request
      .post('/api/search/')
      .type('json')
      .send({ 'url': config.TEST_URL, 'element': config.TEST_ELEMENT, 'level': config.TEST_LEVEL })
      .expect(302, done);
  });

  it('post should return 500 if form has empty text fields', done => {
    request
      .post('/api/search/')
      .type('json')
      .send({ 'url': '', 'element': config.TEST_ELEMENT, 'level': config.TEST_LEVEL })
      .expect(500)
      .end((err, res) => {
        expect(res.text).to.equal(config.search_results.error_form);
        done();
      });
  });

  it('delete should return 200 if ok', done => {
    request
      .delete(config.TEST_REQUEST)
      .expect(200)
      .end((err, res) => {
        expect(res.text).to.equal(config.search_results.delete_ok);
        done();
      });
  });

  it('delete should return 404 if seach request is already deleted', done => {
    request
      .delete(config.TEST_REQUEST)
      .expect(404)
      .end((err, res) => {
        expect(res.text).to.equal(config.search_results.delete_error);
        done();
      });
  });

  it('/api/search/list/ shows search history', done => {
    request
      .get('/api/search/list/')
      .expect(200)
      .end((err, res) => {
        expect(res.text).includes(config.TEST_SEARCH_KEY);
        done();
      });
  });

  it('/ sends search form', done => {
    request
      .get('/')
      .expect(200)
      .end((err, res) => {
        expect(res.text).to.equal(fs.readFileSync('./views/search-form.ejs').toString());
        done();
      });
  });

});
