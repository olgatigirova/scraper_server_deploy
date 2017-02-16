const config = require('config');
const Promise = require('bluebird');
const redis = require('redis');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
const log = require('../log');
const SearchEngine = require('./search_engine').SearchEngine;

let redisClientInstance;
const SEARCH_HISTORY_KEY = 'searchHistory';

module.exports = {
  searchDomGen,
  listSearchReqsGen,
  delSearchKeyGen,
  processFormData,
  parseQuery,
};

function *searchDomGen(args) {
  let searchKey, url_str, element, level;
  let keyExists = 0;
  let foundElements = '';

  const client = yield redisClient();
  [searchKey, url_str, element, level] = parseQuery(args);

  keyExists = yield client.existsAsync(searchKey);
  if (keyExists) {
    foundElements = yield client.getAsync(searchKey);
  } else {
    const search = new SearchEngine(level);
    foundElements = yield* search.SearchDomByUrl(url_str, element);
    yield client.setAsync(searchKey, foundElements);
    yield client.saddAsync(SEARCH_HISTORY_KEY, searchKey);
  }
  yield client.expireAsync(searchKey, getTtl());
  yield client.quitAsync();

  return foundElements;
}

function *listSearchReqsGen() {
  const client = yield redisClient();
  const result = yield client.smembersAsync(SEARCH_HISTORY_KEY);
  yield client.quitAsync();
  return result;
}

function *delSearchKeyGen(args) {
  let searchKey;
  let keyExists = 0;
  let result = false;

  const client = yield redisClient();
  [searchKey] = parseQuery(args);

  keyExists = yield client.existsAsync(searchKey);
  if (keyExists) {
    yield client.delAsync(searchKey);
    result = true;
  }

  yield client.quitAsync();
  return result;
}

function processFormData(req) {
  const data = req.body;
  let url_str = '';
  let level = config.search.levelDefault;
  if (data.level && data.level <= config.search.levelMaxAllowed) {
    level = data.level;
  }
  if (data.url.length > 0 && data.element.length > 0) {
    url_str = `/api/search/?url=${data.url}&element=${data.element}&level=${level}`;
  }
  return url_str;
}

function parseQuery(args) {
  const url_str = args.url.value;
  const element = args.element.value;
  let level = args.level.value;
  if (level === 'undefined' || level < 1 || level > config.search.levelMaxAllowed) {
    level = config.search.levelDefault;
  }

  const searchKey = `{ url: ${url_str}, element: ${element}, level: ${level} }`;
  log.info('search key: ', searchKey);
  return [searchKey, url_str, element, level];
}

function getTtl() {
  return 24 * 60 * 60;
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