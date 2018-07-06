'use strict'

const debug = require('debug')('SmallJS:api:routes')
const express = require('express')
const asyncify = require('express-asyncify')
const auth = require('express-jwt')
const guard = require('express-jwt-permissions')()
const db = require('../smallJS-dbsql')
const bodyParser = require('body-parser')

const config = require('./config')
const api = asyncify(express.Router())
let services, User, Appointment

api.use('/public', express.static(__dirname + '/public'))

api.use(bodyParser.urlencoded({ extended: true }))
api.use(express.json())       // to support JSON-encoded bodies
// api.use(express.urlencoded()); // to support URL-encoded bodies

api.use('*', async (req, res, next) => {
  if (!services) {
    debug('Connecting to database')
    try {
      services = await db(config.db)
    }     catch (error) {
      return next(error)
    }

    User = services.User
    Appointment = services.Appointment
  }
  next()
})

api.get('/', (req, res) => {
  if (services) res.sendFile('/public/html/login.html', {root : __dirname})
  else res.status(500).send('¡Problemas con la DB!')
 })

api.post('/register', async (req, res) => {
  let clone = Object.assign({}, req.body)
  let completeInfo =  Object.assign(clone, {hostname: 'test-host', pid: 1, connected: true})
  let userExisting = await User.findByCCid(clone.ccid).catch(err => {
    console.log(err.stack)
    res.status(500)
  })

  if (userExisting) {
    res.status(400).send('El usuario ya está registrado en el sistema. Inicie sesión')
  }  else {
    let user = await User.createOrUpdate(completeInfo).catch(err => {
    console.log(err.stack)
    res.status(500).send('No, no se pudo guardar la información')
    })

    res.status(200).send(JSON.stringify(user))
  }
})

api.post('/redir', async (req, res) => {
  let clone = Object.assign({}, req.body)
  // La información puede ser revisada
  let user = await User.findByCCid(clone.ccid).catch(err => {
    console.log(err.stack)
    res.status(500)
  })
  if (user.type === clone.type && user.password === clone.password)  {
    res.status(200).send(JSON.stringify(user))
  }    else {
    res.status(500)
  }
})

 api.post('/appointments', async (req, res) => {
  let ccid = req.body.ccid
  delete req.body.ccid
  let clone = Object.assign({}, req.body)
  let completeInfo =  Object.assign(clone, {assignedid:0, assignedname:'', state:1})
  let appointment = await Appointment.createOrUpdate(ccid, completeInfo).catch(err => {
    console.log(err.stack)
    res.status(500).send('No, no se pudo guardar la información')
  })
  res.status(200).send('Cita guardadas')
 })

 api.post('/valide', async (req, res) => {
  let appointments = await Appointment.findByDateGroup('doctorname', req.body.doctorname, req.body.day, req.body.day).catch(err => {
    console.log(err.stack)
    res.status(500).send('No, no se pudo encontrar la información')
  })
  res.status(200).send(appointments)
 })

 api.post('/appointments/all', async (req, res) => {
  let ccid = req.body.ccid
  let appointments = await Appointment.findByCCid(ccid).catch(err => {
    console.log(err.stack)
    res.status(500).send('No se pudo encontrar la información')
  })
  res.status(200).send(appointments)
 })

 api.post('/appointments/free', async (req, res) => {
   let dayinit = req.body.dayinit
   let dayend = req.body.dayend
   let appointments = await Appointment.findNoAssignedByDate(dayinit, dayend).catch(err => {
    console.log(err.stack)
    res.status(500).send('No se pudo encontrar la información')
  })
  res.status(200).send(appointments)
 })

api.post('/appointments/nofree', async (req, res) => {
  let ccid = req.body.ccid
  let id = req.body.id
  let appointment = await Appointment.assignedAndUpdate(ccid, id).catch(err => {
   console.log(err.stack)
   res.status(500).send('No se pudo encontrar la información')
 })
 res.status(200).send(appointment)
})

api.post('/appointments/assign', async (req, res) => {
  let ccid = req.body.ccid
  let dayinit = req.body.dayinit
  let dayend = req.body.dayend
  let appointment = await Appointment.findAssignedByDateGroup('assignedid',ccid, dayinit, dayend).catch(err => {
   console.log(err.stack)
   res.status(500).send('No se pudo encontrar la información')
 })
 res.status(200).send(appointment)
})

module.exports = api
