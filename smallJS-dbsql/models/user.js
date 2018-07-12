'use strict'

const Sequelize = require('sequelize')
const setupDatabase = require('../lib/db')

module.exports = function setupUserModel(config) {
  const sequelize = setupDatabase(config)

  return sequelize.define('user', {

    /* PRIMERO IDENTIFICAMOS AL USER COMPLETAMENTE DENTRO DE NUESTRO SISTEMA */

    // User is admin, doctor, customer?
    type: {
      type: Sequelize.STRING,
    },

    // Nuestro propio id usando documento de identidad
    ccid: {
      type: Sequelize.INTEGER,
      allowNull: false
    },

    /* OTRA INFORMACIÓN DEL USER PENSANDO EN UN ACCESO DIRECTO */

    // Un username para identificar
    username: {
      type: Sequelize.STRING,
      allowNull: false
    },

    // Un password para identificar
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },

    // Nombre
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },

    // Hostname? Bueno para recaudar información
    hostname: {
      type: Sequelize.STRING,
      allowNull: false
    },

    /* INFORMACIÓN DEL USER Y SUS MOVIMENTOS */

    // Tipo de proceso:
    // 1-> Crear
    // 2-> Modificar
    // 3-> Cancelar
    // 4-> Cerrar
    pid: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1
    },

    // ¿Conectado o no conectado?
    connected: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  })
}
