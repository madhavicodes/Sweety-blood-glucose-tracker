require('dotenv').config();

const defaultConfig = {
  client: 'pg',
  connection: process.env.DATABASE_URL || 'postgres://sweety:sweety@localhost:5432/sweety',
  pool: {
    min: 2,
    max: 10
  },
  migrations: {
    directory: './migrations',
    tableName: 'knex_migrations'
  },
  seeds: {
    directory: './seeds'
  }
};

module.exports = {
  development: {
    ...defaultConfig,
    connection: process.env.DATABASE_URL || 'postgres://sweety:sweety@localhost:5432/sweety'
  },
  test: {
    ...defaultConfig,
    connection: process.env.DATABASE_URL_TEST || process.env.DATABASE_URL || 'postgres://sweety:sweety@localhost:5432/sweety_test',
    pool: {
      min: 1,
      max: 5
    }
  },
  production: {
    ...defaultConfig,
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 20
    }
  }
};

