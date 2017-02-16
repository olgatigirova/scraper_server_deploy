const expect = require('chai').expect;
const co = require('co');
const Promise = require('bluebird');
const redis = require('redis');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
const searchHelper = require('../../controllers/search_helper');
const config = require('../test_config');

const TEST_ARGS = {
  url: {
    value: config.TEST_URL
  },
  element: {
    value: config.TEST_ELEMENT
  },
  level: {
    value: config.TEST_LEVEL
  }
};

const TEST_REQ_BODY = {
  body: {
    url: config.TEST_URL,
    element: config.TEST_ELEMENT,
    level: config.TEST_LEVEL
  }
};

let redisClientInstance;

describe('Search Helpers', function () {

  it('should parse args and find elements for given url', done => {
    co(searchHelper.searchDomGen(TEST_ARGS))
      .then(res => {
        expect(res).to.equal(config.search_results.level1);
        isKeyExist(TEST_ARGS, 1, done);
      })
      .catch(err => {
        done(err);
      });
  }).timeout(5000);


  it('should delete search key from redis', done => {
    co(searchHelper.delSearchKeyGen(TEST_ARGS))
      .then(() => {
        isKeyExist(TEST_ARGS, 0, done);
      })
      .catch(err => {
        done(err);
      });
  });

  it('even deleted request should be in redis history', done => {
    co(searchHelper.listSearchReqsGen())
      .then(res => {
        let searchKey;
        [searchKey] = searchHelper.parseQuery(TEST_ARGS);
        expect(res).includes(searchKey);
        done();
      })
      .catch(err => {
        done(err);
      });
  });

  it('form data should be converted to correct url', done => {
    const url_str = searchHelper.processFormData(TEST_REQ_BODY);
    expect(url_str).to.equal(config.TEST_REQUEST);
    done();
  });
});

function isKeyExist(args, exists, done) {
  co((function *(args) {
    let searchKey;
    let keyExists = 0;

    const client = yield redisClient();
    [searchKey] = searchHelper.parseQuery(args);
    keyExists = yield client.existsAsync(searchKey);
    yield client.quitAsync();
    return keyExists;
  })(args))
  .then(res => {
    expect(res).to.equal(exists);
    done();
  })
  .catch(done);
}

function redisClient() {
  return new Promise((resolve, reject) => {
    if (redisClientInstance && redisClientInstance.connected) {
      return resolve(redisClientInstance);
    }
    const client = redis.createClient(config.redisOptions);
    client.on('error', reject);
    client.on('connect', () => {
      redisClientInstance = client;
      return resolve(client);
    });
  });
}
