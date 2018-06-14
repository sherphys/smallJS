'use strict'

const Sequelize = require('sequelize')
const setupDatabase = require('../lib/db')

module.exports = function setupScheduleUserModel(config) {
  const sequelize = setupDatabase(config)

  return sequelize.define('scheduleuser', {

    // Date?
    day: {
      type: Sequelize.DATEONLY,
      allowNull: false
    },

    /* user_id
    userid: {
      type: Sequelize.INTEGER
      // allowNull: false
    }, */

    // JSON de las citas [cita1,cita2,cita3,...,citan], cada elemento cita tendría
    // Nivel de la cita: (1 o 2)
    // Tipo de cita: Nivel 1 (General, Odontología, Higienista) Nivel 2 (Especialistas)
    // Médico: (Nombre del Médico)
    // Ubicación: (código IPS PRINCIPAL O EXTRAS)
    // Hora: (H:M:S)
    // Extra: Información extra (precios, requerimentos, etc)
    appointments: {
      type: Sequelize.JSON,
      allowNull: false
    }
  })
}
