'user strict'

const debug = require('debug')('SmallJS:api:db')

module.exports = {
  db: {
    database: process.env.DB_NAME || 'mydbeps',
    username: process.env.DB_USER || 'shersnape',
    password: process.env.DB_PASS || 'itachi',
    host: process.env.DB_HOST || 'localhost',
    dialect: 'postgres',
    logging: s => debug(s),
    setup: process.env.DB_SETUP || false,
    operatorsAliases: false
  },
  auth: {
    secret: process.env.SECRET || 'itachi',
    admincheck: process.env.ADMINCHECK || 'aja',
  }
}

