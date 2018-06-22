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

api.use(bodyParser.urlencoded({ extended: true }))
api.use(express.json());       // to support JSON-encoded bodies
//api.use(express.urlencoded()); // to support URL-encoded bodies

api.use('*', async (req, res, next) => {
  if (!services) {
    debug('Connecting to database')
    try {
      services = await db(config.db)
    } 
    catch (error) {
      return next(error)
    }

    User = services.User
    Appointment = services.Appointment
  }
  next()
})

api.get("/", (req, res) => {
  if(services) res.redirect('/admin')
  else res.status(400).send("¡Problemas con la DB")
 })

api.get("/admin", (req, res) => {
  if(!User.findById(1)) res.sendFile('public/index1.html' , { root : __dirname})
  else res.sendFile('public/index2.html' , { root : __dirname})
 })

 api.post("/admin/0", async (req, res) => {
  let clone =Object.assign({}, req.body)
  let completeInfo =  Object.assign(clone,{type:'admin', hostname: 'test-host', pid: 1, connected: true})
  let Admin = await User.createOrUpdate(completeInfo).then(item => { 
    res.sendFile('public/index2.html' , { root : __dirname})
  }).catch(err => {
    res.status(400).send("No, no se pudo guardar la información")
  })
 })

 api.get("/doctors", (req, res) => {
  res.sendFile('public/index.html' , { root : __dirname})
 })

 /*
 type='admin'
 hostname: 'test-host',
 pid: 1,
 connected: true,
 createdAt: new Date(),
 updatedAt: new Date()*/

// app.use(express.static('public'));
// Lo que hacemos aquí es pedir un archivo importante: la base de datos




// /////VAMOS A HACER LA PRIMERA SOLICITUD
/*api.get('/user', auth(config.auth), async (req, res, next) => {
    debug('A request has come to /user')
    const { user } = req
    if (!user || !user.username) {
      return next(new Error('Not authorized'))
    }
    let users = []
    try {
      if (user.admin) {
        users = await User.findConnected()
      }
      else {
      agents = await Agent.findByUsername(user.username)
      }
    }
    catch (error) {
      return next(error)
    }
    res.send(users)
  }) */

module.exports = api
