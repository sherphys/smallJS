'use strict'

const Sequelize = require('sequelize')
const setupDatabase = require('../lib/db')

module.exports = function setupAppointmentModel(config) {
  const sequelize = setupDatabase(config)

  return sequelize.define('appointment', {

    // Date?
    day: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },

    // Hour init?
    timeinit: {
      type: Sequelize.TIME,
      allowNull: false
    },

    // Hour finish?
    timeend: {
        type: Sequelize.TIME,
        allowNull: false
    },

    // Doctor firstname
    doctorname: {
        type: Sequelize.STRING,
        allowNull: false
    },

    // Tipo de cita
    type: {
        type: Sequelize.STRING,
        allowNull: false
    },

    // Direcction (code branch)
    branch: {
        type: Sequelize.INTEGER,
        allowNull: false
    },

    // Estado
    // 1 --> No asignada
    // 2 --> Asignada
    // 3 --> Cerrada
    state:{
        type: Sequelize.INTEGER,
        allowNull: false
    },

    // Asignada a:
    assignedid:{
        type: Sequelize.INTEGER,
        defaultValue: 0
    },

    // Asignada a:
    assignedname:{
        type: Sequelize.STRING,
        defaultValue: ''
    },

    // JSON de información extra
    // Extra: Información extra (precios, requerimentos, etc)
    extra: {
      type: Sequelize.JSON,
      defaultValue: JSON.parse('[]')
    }
  })
}
