const knex = require('knex');
const knexConfig = require('../../knexfile');
const { NODE_ENV } = require('../config/env');

const environment = NODE_ENV || 'development';
const config = knexConfig[environment] || knexConfig.development;

let dbInstance;

function getDb() {
  if (global.__TEST_KNEX__) {
    return global.__TEST_KNEX__;
  }
  if (!dbInstance) {
    dbInstance = knex(config);
  }
  return dbInstance;
}

const targetFn = function(...args) {
  return getDb()(...args);
};

const proxyDb = new Proxy(targetFn, {
  get(target, prop) {
    const db = getDb();
    const val = db[prop];
    if (typeof val === 'function') {
      return val.bind(db);
    }
    return val;
  },
  apply(target, thisArg, argumentsList) {
    const db = getDb();
    return db(...argumentsList);
  }
});

module.exports = proxyDb;
