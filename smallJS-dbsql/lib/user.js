'use strict'

//Función setup del User cuenta con varios métodos
//1. Creación y actualización
//2. Encontrar un id
//3. Encontrar un ccid
//4. Encontrar un 


module.exports = function setupUser(UserModel) {
  // Primero vamos a hacer un funcion asincrona para crear o actualizar los datos
  // El usuario existe si existe la condición
    async function createOrUpdate(user){
    const cond = {
      where: {
        ccid: user.ccid
      }
    }
    
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



  /****************** Funciones de búsqueda ****************/

  //Buscar por id (one)
  function findById(id) {
    return UserModel.findById(id)
  }// Fin de function findById

  //Buscar por ccid (one)
  function findByCCid(ccid) {
    return UserModel.findOne({
      where: {
        ccid: ccid
      }
    })
  }// Fin de funtion findByCCid

  //Buscar por IPS (any) 
  function findByIPS(ips) {
    return UserModel.findAll({
      where: {
        ips:ips
      }
    })
  }// Fin de function findByIPS

  function notlocate(ips) {
    
     // Primero definimos una condición de existencia del id
     // Luego si el usuario está allocado
     const condips = {
      where: { ips: user.ips }
      const allocationUser = await UserModel.findOne(condips)
    }

    return UserModel.findOne({
      where: {
        ips:ips
      }
    })
  }// Fin de function findById*/


  function findAll () {
    return AgentModel.findAll()
  }

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
    findByIPS
    // findAll,
    // findConnected,
    // findByUsername
  }
}
