'use strict'

module.exports = function setupUser(UserModel) {
  // Primero vamos a hacer un funcion asincrona para crear o actualizar los datos
  // El usuario existe si existe la condición
    async function createOrUpdate(user)     {
    const cond = {
      where: {
        ccid: user.ccid
      }
    }
     // Primero definimos una condición de existencia
    const condips = {
      where: { ips: user.ips }
    }

    // Luego creamos una variable que nos devuelva si existe o no la condición
    const existingUser   = await UserModel.findOne(cond)
    const allocationUser = await UserModel.findOne(condips)
    console.log(allocationUser)

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

  function findById(id) {
    return UserModel.findById(id)
  }// Fin de function findById

  function findOne(id) {
    return UserModel.findOne(id)
  }// Fin de function findById


  function findByCCid(ccid) {
    return UserModel.findOne({
      where: {
        ccid
      }
    })
  }// Fin de funtion findByCCid

  /*
  function findAll () {
    return AgentModel.findAll()
  }
  */

  /*
  function findConnected () {
    return AgentModel.findAll({
      where: {
        connected: true
      }
    })
  }
  */

  /*
  function findByUsername (username) {
    return AgentModel.findAll({
      where: {
        username,
        connected: true
      }
    })
  }
  */

  return {
    createOrUpdate,
    findById,
    findByCCid,
    findOne
    // findAll,
    // findConnected,
    // findByUsername
  }
}
