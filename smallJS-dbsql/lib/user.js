'use strict'

// const Sequelize = require('sequelize')
// const Op = Sequelize.Op

// Función setup del User cuenta con varios métodos
// 1. Creación y actualización
// 2. Encontrar un id
// 3. Encontrar un ccid
// 4. Encontrar a todos
// 5. Agrupar por tipos

module.exports = function setupUser(UserModel) {
  async function createOrUpdate(user) {
    const cond = {
      where: {
        ccid: user.ccid
      }
    }
     // Primero vamos a hacer un funcion asincrona para crear o actualizar los datos
    // El usuario existe si existe la condición
    // Luego creamos una variable que nos devuelva si existe o no la condición
    const existingUser   = await UserModel.findOne(cond)

    // De ser verdadera, entonces el usuario existe y realizamos una actualización
    if (existingUser) {
      const updated = await UserModel.update(user, cond)
      return updated ? UserModel.findOne(cond) : existingUser
    }

    // El if anterior devuelve el existingUser si no existe el usuario, no hace más
    // Y se modifica el user crendo un JSON
    const result = await UserModel.create(user)
    return result.toJSON()
  }// Fin de async function

  /** **************** Funciones de búsqueda ****************/

  // Buscar por id (one)
  function findById(id) {
    return UserModel.findById(id)
  }// Fin de function findById

  // Buscar por ccid (one)
  function findByCCid(ccid) {
    return UserModel.findOne({
      where: {
        ccid: ccid
      }
    })
  }// Fin de funtion findByCCid

  // Bucar a todos (all)
  /* function findAll() {
    return UserModel.findAll()
  }

  function findConnected () {
    return UserModel.findAll({
      where: {
        connected: true
      }
    })
  } */

  function findGroup(property, value) {
    let result

    switch (property) {
      case 'type':
        console.log('Type')
        result = UserModel.findAll({
          where: {
            type: value
          }
        })
        break
      case 'connected':
        console.log('Connected')
        result = UserModel.findAll({
          where: {
            connected: value
          }
        })
        break
      case 'pid':
        console.log('Pid')
        result = UserModel.findAll({
        where: {
          pid: value
        }
      })
        break
      default:
        console.log('Default')
        result = UserModel.findAll()
        break
    }
    return result
  }

  return {
    createOrUpdate,
    findById,
    findByCCid,
    findGroup
  }
}
