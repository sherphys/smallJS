'use strict'

// Primero vamos a definir 3 usuarios:
const user1 = {
    type: 'customer',
    id: 1,
    ccid: 10,
    name: 'Sheryl Avendano',
    username: 'Shers',
    password: 'ajayque',
    hostname: 'test-host',
    pid: 1,
    connected: true,
    createdAt: new Date(),
    updatedAt: new Date()
    // operatorsAliases: false
  }

const user2 = {
type: 'doctor',
id: 2,
ccid: 11,
name: 'Pepito Pérez',
username: 'Shers',
password: 'ajayque',
hostname: 'test-host',
pid: 1,
connected: true,
createdAt: new Date(),
updatedAt: new Date()
// operatorsAliases: false
}

const user3 = {
    type: 'admin',
    id: 3,
    ccid: 13,
    name: 'Fulanito detal',
    username: 'Shers',
    password: 'ajayque',
    hostname: 'test-host',
    pid: 1,
    connected: true,
    createdAt: new Date(),
    updatedAt: new Date()
    // operatorsAliases: false
  }

// Entonces los usuarios son
const users = [user1, user2, user3]

// Hacemos varias citas de Pepito Pérez
const appointment = {
  id:1,
  userId:2,
  day: '2018-06-20',
  hourinit: '8:00',
  hourend:  '9:00',
  doctorname: 'Pepito Pérez',
  type: 'General',
  branch:1,
  state:1,
  assignedid:0,
  assignedname:'',
  createdAt: new Date(),
  updatedAt: new Date()
  // operatorsAliases: false
}

const appointmentup = {
  id:2,
  userId:2,
  day: '2018-06-21',
  hourinit: '9:00',
  hourend:  '10:00',
  doctorname: 'Pepito Pérez',
  type: 'General',
  branch:1,
  state:2,
  assignedid:user1.ccid,
  assignedname:user1.name,
  createdAt: new Date(),
  updatedAt: new Date()
  // operatorsAliases: false
}

const templete = {
  userId:2,
  doctorname: 'Pepito Pérez',
  type: 'General',
  branch:1,
  state:1,
  assignedid:0,
  assignedname:'',
  createdAt: new Date(),
  updatedAt: new Date()
// operatorsAliases: false
}

const appointments = [
  appointment,
  appointmentup,
  extend(templete, {
    id:2,
    day: '2018-06-21',
    hourinit: '9:00',
    hourend:  '10:00'
    }),
  extend(templete, {
    id:3,
    day: '2018-06-24',
    hourinit: '14:00',
    hourend:  '16:00'
    }),
  extend(templete, {
    id:4,
    day: '2018-06-25',
    hourinit: '8:00',
    hourend:  '9:00'
    })
]

function extend(obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

module.exports = {
  user:user1,
  docuser:user2,
  oneapp: appointment,
  allapp: appointments,
  upapp: appointmentup,
  byId: id => appointments.filter(a => a.id === id).shift(),
  byCCid: id => users.filter(a => a.ccid === id).shift(),
  byCCidCustomer: (id) => users.filter(a => (a.ccid === id) && (a.type === 'customer')),
  byCCidCustomerOrAdmin: (id) => users.filter(a => (a.ccid === id) && ((a.type) === 'customer' || a.type === 'admin')).shift(),
  byrel: (id, userid) => appointments.filter(a => (a.id === id) && (a.userId === userid)),
  bydays: (day1, day2) => appointments.filter(a => (a.day >= day1) && (a.day <= day2) && (a.state === 1))
  // byId: id => users.filter(a => a.id === id).shift()
  // byextend: assign => extend(appointment,assign)
}
