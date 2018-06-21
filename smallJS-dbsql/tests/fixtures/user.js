'use strict'

const user = {
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

const usertemplete = {
  name: 'Sheryl Avendano',
  username: 'Shers',
  password: 'ajayque',
  hostname: 'test-host',
  createdAt: new Date(),
  updatedAt: new Date()
  // operatorsAliases: false
}

const users = [
  user,
  extend(usertemplete, {
     type: 'customer', id: 2, ccid: 11, connected: false
    }),
  extend(usertemplete, {
     type: 'doctor',   id: 3, ccid: 12, connected: true
    }),
  extend(usertemplete, {
     type: 'doctor',   id: 4, ccid: 13, connected: false
    })
]

function extend(obj, values) {
  const clone = Object.assign({}, obj)
  return Object.assign(clone, values)
}

module.exports = {
  single: user,
  all: users,
  connected: users.filter(a => a.connected),
  Shers: users.filter(a => a.username === 'Shers'),
  type: id => users.filter(a => a.type === id),
  byCCid: id => users.filter(a => a.ccid === id).shift(),
  byId: id => users.filter(a => a.id === id).shift()
}
