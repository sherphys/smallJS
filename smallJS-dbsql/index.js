'use stritc'
const setupDatabase = require('./lib/db')
const setupUserModel = require('./models/user')
const setupScheduleIPSModel = require('./models/scheduleips')
const setupScheduleUserModel = require('./models/scheduleuser')
const defaults = require('defaults')

const setupUser = require('./lib/user')
// const setupScheduleIPSModel = require('./models/scheduleips')
// const setupScheduleUserModel = require('./models/scheduleuser')

module.exports = async function(config) {
  config = defaults(config, {
    dialect: 'sqlite',
    pool: {
      max: 10,
      min: 0,
      idle: 10000
    },
    query: {
      raw: true
    }
  })

  const sequelize = setupDatabase(config)
  const UserModel = setupUserModel(config)
  const ScheduleIPSModel = setupScheduleIPSModel(config)
  const ScheduleUserModel = setupScheduleUserModel(config)

  UserModel.hasMany(ScheduleUserModel)
  ScheduleUserModel.belongsTo(UserModel)

  ScheduleIPSModel.belongsTo(UserModel, {as: 'IPS'})

  await sequelize.authenticate()

  if (config.setup) {
    await sequelize.sync({ force: true })
  }

  const User = setupUser(UserModel)
  const ScheduleUser = {}
  const ScheduleIPS = {}
  return {
    User,
    ScheduleUser,
    ScheduleIPS
  }
}

