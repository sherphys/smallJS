'use strict'

const Sequelize = require('sequelize')
const setupDatabase = require('../lib/db')

module.exports = function setupUserModel(config) {
  const sequelize = setupDatabase(config)

  return sequelize.define('user', {

    /* PRIMERO IDENTIFICAMOS AL USER COMPLETAMENTE DENTRO DE NUESTRO SISTEMA */

    // User is admin?
    flag: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false },

    // Nuestro propio id usando documento de identidad
    ccid: {
      type: Sequelize.STRING,
      allowNull: false
    },

    // IPS_id
    ips: {
      type: Sequelize.INTEGER,
      allowNull: false
    },

    // IPS_id secundarias (se puede poner por orden de prioridad)
    // La idea es que sea un objeto JSON pero tipo arreglo
    // Dependiendo de la IPS principal el arreglo podría ser de 2 o más valores
    ipsExtra: {
      type: Sequelize.JSON,
      allowNull:false
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
    firstname: {
      type: Sequelize.STRING,
      allowNull: false
    },

    // Apellido
    lastname: {
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
    pid: {
      type: Sequelize.INTEGER,
      allowNull: false
    },

    // ¿Conectado o no conectado?
    connected: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  })
}
