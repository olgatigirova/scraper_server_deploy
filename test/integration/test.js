const app = require('../../app');
const request = require('supertest');
const debug = require('debug')('test');
const requestInstance = request(app);

before(function() {
  debug('>>>>>>>>>>>>>Global setup<<<<<<<<<<<<<<<<<<<<<<<');
});

after(function() {
  debug('>>>>>>>>>>>>>Global teardown<<<<<<<<<<<<<<<<<<<<<<<');
});

module.exports.request = requestInstance;
