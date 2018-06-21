'use stritc'
const setupDatabase = require('./lib/db')
const setupUserModel = require('./models/user')
const setupAppointmentModel = require('./models/appointment')
const defaults = require('defaults')

const setupUser = require('./lib/user')
const setupAppointment = require('./lib/appointment')

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
  const AppointmentModel = setupAppointmentModel(config)

  UserModel.hasMany(AppointmentModel)
  AppointmentModel.belongsTo(UserModel)

  await sequelize.authenticate()

  if (config.setup) {
    await sequelize.sync({ force: true })
  }

  const User =  setupUser(UserModel)
  const Appointment = setupAppointment(AppointmentModel, UserModel)
  return {
    User,
    Appointment
  }
}

