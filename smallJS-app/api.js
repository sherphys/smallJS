'use strict'

/*MÓDULOS VARIOS*/ 
const debug = require('debug')('SmallJS:api:routes')
const express = require('express')
const asyncify = require('express-asyncify')
const bodyParser = require('body-parser')

/*MÓDULOS DE SEGURIDAD*/
const jwt = require('jsonwebtoken')
const passport = require('passport')
const passportJWT = require("passport-jwt"); 
const JWTStrategy = passportJWT.Strategy

const config = require('./config')

/*var params = {  
  secretOrKey: config.auth.secret,
  jwtFromRequest: ExtractJwt.fromAuthHeader()
};
var strategy= new JWTStrategy(data, function (payload, done) {
  return UserModel.findOne({ccid:payload.ccid, type:payload.type, password:payload.password})
     .then(user => {
         if (!user) {
             return cb(null, false, {message: 'ccid o password incoreccto.'});
         }
         return cb(null, user, {message: 'Login realizado'});
    })
    .catch(err => cb(err));
  })

passport.use(strategy)*/


/*MÓDULOS DE SERVICIOS*/
const db = require('../smallJS-dbsql')
const api = asyncify(express.Router())
var services, User, Appointment


/*USOS EN LA API*/
api.use('/public', express.static(__dirname + '/public'))
api.use(bodyParser.urlencoded({ extended: true }))
api.use(express.json())     
api.use(passport.initialize())  


//Cargamos las DB en todas partes
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

//Pedimos confirmación que los servicios de la DB han sido cargados
api.get('/', (req,res) => {
  if (services) res.sendFile('/public/html/index.html', {root : __dirname})
  else res.status(500).send('¡Problemas con la DB!')
})

//Para el manejo de admin

api.get('/admin', async (req,res) => {
  res.status(200).sendFile('public/html/login.html', {root: __dirname})
})

api.get('/admin/signup', async (req,res) => {
   res.status(200).sendFile('public/html/signup.html', {root: __dirname})
})

//Para el manejo de admin
api.get('/admin/validate', async (req,res) => {
  res.status(200).sendFile('public/html/signup.html', {root: __dirname})
})

//Para poder ver todos los usuarios
api.get('/users',  passport.authenticate('jwt', {session: false }), async (req, res, next) => {
  debug('A request has come to /users')

  const user  = await User.findByCCid(redq.ccid).catch(err => {
    console.log(err.stack)
    res.status(500)
  })

  if (!user || !user.ccid) {
    return next(new Error('No autorizado'))
  }

  let users = []

  try {
    if (user.admin) {
      users = await User.all()
    }
  }catch (e) {
    return next(e)
  }
  res.send(users)
})

//Registro, creación de un usuario nuevo
api.post('/register', async (req, res) => {
  let clone = Object.assign({}, req.body)
  let confirm=clone.confirm
  delete clone.confirm
  const completeInfo =  Object.assign(clone, {hostname: 'test-host', pid: 2, connected: false})
  const userExisting = await User.findByCCid(clone.ccid).catch(err => {
    console.log(err.stack)
    res.status(500)
  })

  if (userExisting) {
    res.status(400).send('El usuario ya está registrado en el sistema. Inicie sesión')
  }  
  else {
    
    if(!(clone.type==="admin") || confirm===config.db.password)
    {
      let user = await User.createOrUpdate(completeInfo).catch(err => {
      console.log(err.stack)
      res.status(500).send('No se pudo guardar la información')
      })
      res.status(200).send(JSON.stringify(user))
    }
    else res.status(400).send('Usted no tiene permisos para registrarse como admin')  
  }
})

//Login de usuario
api.post('/login', async (req, res) => {
  let clone = Object.assign({}, req.body)
  // La información puede ser revisada
  let user = await User.findByCCid(clone.ccid).catch(err => {
    console.log(err.stack)
    res.status(500)
  })
  if (user.password === clone.password && user.type===clone.type)  {
    const completeInfo =  Object.assign(clone, {hostname: 'test-host', pid: 1, connected: true})
    user = await User.createOrUpdate(completeInfo).catch(err => {
      console.log(err.stack)
      res.status(500).send('No se pudo guardar la información')
    })
    var payload = {
      ccid: user.ccid,
      username:user.username,
      password:user.password,
      type:user.type
    }
    let token = jwt.sign(payload, config.auth.secret);
    res.status(200).json({message: "ok", token: token});
  }    
  else {
    if(user.password != clone.password ) res.status(400).send("Contraseña equivocada")
    else res.status(500).send("Usuario no clasificado, Comunicarse con el Administrador")
  }
})


api.post('/logout', async (req, res) => {
  let clone = Object.assign({}, req.body)
  // La información puede ser revisada
  let user = await User.findByCCid(clone.ccid).catch(err => {
    console.log(err.stack)
    res.status(500)
  })
  const completeInfo =  Object.assign(clone, {hostname: '', pid: 0, connected: false})
  user = await User.createOrUpdate(completeInfo).catch(err => {
    console.log(err.stack)
    res.status(500).send('No se pudo guardar la información')
  })
  res.status(200).send("Sesión cerrada")
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
 res.status(200).send("Cita asignada")
})

api.post('/appointments/cancel', async (req, res) => {
  let ccid = req.body.ccid
  let id = req.body.id
  let appointment = await Appointment.canceledAndUpdate(ccid, id).catch(err => {
   console.log(err.stack)
   res.status(500).send('No se pudo encontrar la información')
 })
 res.status(200).send("Cita cancelada")
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
