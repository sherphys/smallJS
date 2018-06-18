'use strict'

const Sequelize = require('sequelize')
const Op = Sequelize.Op
let result
module.exports = function setupAppointment(AppointmentModel, UserModel) {
    // Primero vamos a hacer un funcion asincrona para crear o actualizar los datos
    // La vamos asignar a un usuario específico.
      async function create(ccid, appointment) {
      const user = await UserModel.findOne({
        where: {ccid}
      })
      // Existe y es un doctor?
      if (user && user.type === 'doctor') {
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
            [Op.lt]: dayinit,
            [Op.gt]: dayend
          },
          state:1
        }
      })
    }// Fin de async function findNoAssignedByWeek

    // O las citas por días no asignadas con alguna condición más
    async function findNoAssignedByGroup(property, value, dayinit, dayend) {
      switch (property) {
        case 'type':
          console.log('Type')
          result = AppointmentModel.findAll({
            where: {
              day:{
                [Op.lt]: dayinit,
                [Op.gt]: dayend
              },
              type: value,
              state:1
            }
          })
          break
        case 'doctorname':
          console.log('doctorname')
          result = AppointmentModel.findAll({
            where: {
              day:{
                [Op.lt]: dayinit,
                [Op.gt]: dayend
              },
              doctorname:value,
              state:1
            }
          })
          break
        case 'branch':
          console.log('branch')
          result = AppointmentModel.findAll({
            where: {
              day:{
                [Op.lt]: dayinit,
                [Op.gt]: dayend
              },
              branch:value,
              state:1
            }
          })
          break
        default:
          console.log('Default')
          result = AppointmentModel.findAll()
          break
      }
      return result
    }// Fin de async function findNoAssignedByGroup

    // O las citas por día sin importar la asignación con alguna condición más
    async function findByDayGroup(property, value, dayinit, dayend) {
      switch (property) {
        case 'type':
          console.log('Type')
          result = AppointmentModel.findAll({
            where: {
              day:{
                [Op.lt]: dayinit,
                [Op.gt]: dayend
              },
              type: value
            }
          })
          break
        case 'doctorname':
          console.log('doctorname')
          result = AppointmentModel.findAll({
            where: {
              day:{
                [Op.lt]: dayinit,
                [Op.gt]: dayend
              },
              doctorname:value
            }
          })
          break
        case 'branch':
          console.log('branch')
          result = AppointmentModel.findAll({
            where: {
              day:{
                [Op.lt]: dayinit,
                [Op.gt]: dayend
              },
              branch:value
            }
          })
          break
        default:
          console.log('Default')
          result = AppointmentModel.findAll()
          break
      }
      return result
    }

    async function assignedAndUpdate(appointment, user) {
      const condUser = {
        where: {
          ccid: user.ccid,
          type: 'customer'
        }
      }
      // Luego creamos una variable que nos devuelva si existe ese usuario como cliente
      const existingUser   = await UserModel.findOne(condUser)
      // Existe y es un cliente
      if (existingUser) {
        const updated = await AppointmentModel.update(appointment, { assignedid: user.id , assignedname:user.name,assigned:2})
        return updated ? AppointmentModel.findOne(where:{ assignedid: user.id }) : existingUser
      }
      //Aquí hay que poner algo por si no se actualiza. 
    }// Fin de async function create

    async function canceledAndUpdate(appointment,user) {
      const condUser = {
        where: {
          ccid: user.ccid,
          type: {
            [Op.or]:{
              [Op.eq]:'customer'
              [Op.eq]:'admin'
            }
          }
        }
      }
      // Luego creamos una variable que nos devuelva si existe ese usuario como cliente
      const existingUser   = await UserModel.findOne(condUser)
      // Existe y es un cliente
      if (existingUser && appointment.assigned===2) {
        if (user.type==='customer' && appointment.assignedid===user.id || user.type==='admin'){
          const updated = await AppointmentModel.update(appointment, { assignedid:'', assignedname:'',assigned:1})
        }
        return updated ? AppointmentModel.findOne(where:{ assignedid: user.id })  : existingUser
      }
      //Aquí hay que poner algo por si no se actualiza. 
    }// Fin de async function create

    async function UpdateNoAsigned(ccid, appointment) {
      const condUser = {
        where: {
          ccid: ccid,
          type: 'customer'
        }
      }
      // Luego creamos una variable que nos devuelva si existe ese usuario como cliente
      const existingUser   = await UserModel.findOne(condUser)
      // Existe y es un cliente
      if (existingUser) {
        const updated = await AppointmentModel.update(appointment, { assignedid: user.id , assignedname:user.name,assigned:2})
        return updated ? UserModel.findOne(condUser) : existingUser
      }
      //Aquí hay que poner algo por si no se actualiza. 
    }// Fin de async function create


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
    function findAll() {
      return UserModel.findAll()
    }

    function findConnected() {
      return UserModel.findAll({
        where: {
          connected: true
        }
      })
    }

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
      create
    }
  }

