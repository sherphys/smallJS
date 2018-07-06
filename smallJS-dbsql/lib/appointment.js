'use strict'

const Sequelize = require('sequelize')
const Op = Sequelize.Op
module.exports = function setupAppointment(AppointmentModel, UserModel) {
    // Primero vamos a hacer un funcion asincrona para crear o actualizar los datos
    // La vamos asignar a un usuario específico.
    async function createOrUpdate(ccid, appointment) {
      const user = await UserModel.findOne({
        where: {ccid}
      })
      const existingAppointmentBelongtoUser   = await AppointmentModel.findOne({
        where: {
          day:appointment.day,
          hourinit:appointment.hourinit,
          hourend:appointment.hourend,
          userId:user.id
        }
      })
      const condCreatingAndUpdate = (appointment.assignedid === 0) && (appointment.assignedname === '')
      && (appointment.state === 1) && (user.type === 'doctor')

      // Si la cita ya existe, se actualiza
      if (existingAppointmentBelongtoUser && condCreatingAndUpdate) {
        const updated = await AppointmentModel.update(appointment, {id:appointment.id})
        return updated ? AppointmentModel.findById(appointment.id) : existingAppointmentBelongtoUser
      }

      // El usuario existe, es un doctor y ha diligencciado correctamente la cita
      if (condCreatingAndUpdate) {
        Object.assign(appointment, { userId: user.id })
        const result = await AppointmentModel.create(appointment)
        return result.toJSON()
      }
    }// Fin de async function create

    // Ahora vamos a agrupar por día/días las citas no asignadas ya creada por los doctores.
    // ¿Debería usar async? ¿Vamos a usar await?
    async function findNoAssignedByDate(dayinit, dayend) {
      return AppointmentModel.findAll({
        where: {
          day:{
            [Op.gte]: dayinit,
            [Op.lte]: dayend
          },
          state:1
        }
      })
    }// Fin de async function findNoAssignedByDate

    // O las citas por días no asignadas con alguna condición más
    async function findNoAssignedByDateGroup(property, value, dayinit, dayend) {
      let query = {
        where: {
          day:{
            [Op.gte]: dayinit,
            [Op.lte]: dayend
          },
          state:1
        }
      }

      switch (property) {
        case 'type':
          query.where.type = value
          break
        case 'doctorname':
          query.where.doctorname = value
          break
        case 'branch':
          query.where.branch = value
          break
        default:
          query = null
          break
      }
      return AppointmentModel.findAll(query)
    }// Fin de async function findNoAssignedByGroup

    async function findAssignedByDateGroup(property, value, dayinit, dayend) {
      let query = {
        where: {
          day:{
            [Op.gte]: dayinit,
            [Op.lte]: dayend
          },
          state:2
        }
      }

      switch (property) {
        case 'type':
          query.where.type = value
          break
        case 'doctorname':
          query.where.doctorname = value
          break
        case 'branch':
          query.where.branch = value
          break
        case 'assignedid':
          query.where.assignedid = value
          break
        default:
          query = null
          break
      }
      return AppointmentModel.findAll(query)
    }// Fin de async function findNoAssignedByGroup

    
    // O las citas por día sin importar la asignación con alguna condición más
    async function findByDateGroup(property, value, dayinit, dayend) {
      let query = {
        where: {
          day:{
            [Op.gte]: dayinit,
            [Op.lte]: dayend
          }
        }
      }
      switch (property) {
        case 'type':
          query.where.type = value
          break
        case 'doctorname':
          query.where.doctorname = value
          break
        case 'branch':
          query.where.branch = value
          break
        default:
          console.log('Default')
          query = null
          break
      }
      return await AppointmentModel.findAll(query)
    }

    async function assignedAndUpdate(ccid, id) {
      const condUser = {
        where: {
          ccid: ccid,
          type: 'customer'
        }
      }
      // Luego creamos una variable que nos devuelva si existe ese usuario como cliente
      const user   = await UserModel.findOne(condUser)
      // Probar que existe la cita
      const appointment   = await AppointmentModel.findById(id)
      // o por el id de la cita, para ese usamos findId
      // Existe y es un cliente

      if (user && appointment) {
        let changes={assignedid: user.ccid, assignedname: user.name, state:2}
        let selector={
           where: {
              id: appointment.id }
        }
        //Object.assign(appointment, { assignedid: user.ccid })
        const updated = await AppointmentModel.update(changes,selector)//, assignedid: user.ccid, assignedname: user.name, state:2})
        return updated ? AppointmentModel.findById(appointment.id) : appointment
      }
      else return appointment
      // Aquí hay que poner algo por si no se actualiza.
    }// Fin de async function create

    async function canceledAndUpdate(ccid, appointment) {
      const condUser = {
        where: {
          ccid: ccid,
          type: {
            [Op.or]:{
              [Op.eq]:'customer',
              [Op.eq]:'admin'
            }
          }
        }
      }
      // Luego creamos una variable que nos devuelva si existe ese usuario como cliente
      const user   = await UserModel.findOne(condUser)
       // Probar que existe la cita
      const appointment   = await AppointmentModel.findById(appointment.id)
      // o por el id de la cita, para ese usamos findId
      // Existe y es un cliente
      if (user && appointment.assigned === 2) {
        if (user.type === 'customer' && appointment.assignedid === user.ccid || user.type === 'admin') {
          let changes={assignedid:'', assignedname:'', state:1}
          let selector= {
            where: {
              id: appointment.id 
            }
          }
          const updated = await AppointmentModel.update(changes, selector)  
          return updated ? AppointmentModel.findOne(appointment.id) : appointment
        }
      }
      else return appointment
      // Aquí hay que poner algo por si no se actualiza.
    }// Fin de async function create

    /** **************** Funciones de búsqueda normal ****************/

    // Buscar por id (one)
    function findById(id) {
      return AppointmentModel.findById(id)
    }// Fin de function findById

    // Buscar por ccidAssigned (one)
    async function findByCCid(ccid) {
      const user = await UserModel.findOne({
        where: {ccid}
      })
      return AppointmentModel.findAll({
        where: {
          userId: user.id
        }
      })
    }// Fin de funtion findByCCid

    async function findByCCidDate(ccid, dayinit, dayend) {
      const user = await UserModel.findOne({
        where: {ccid}
      })
      return AppointmentModel.findAll({
        where: {
          userId: user.id,
          day:{
            [Op.gte]: dayinit,
            [Op.lte]: dayend
          }
        }
      })
    }// Fin de funtion findByCCid

    return {
      createOrUpdate,
      findNoAssignedByDate,
      findNoAssignedByDateGroup,
      findAssignedByDateGroup,
      findByCCidDate,
      findByDateGroup,
      findByCCid,
      findById,
      assignedAndUpdate,
      canceledAndUpdate
    }
  }

