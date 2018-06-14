'use strict'

const user = {
  flags:true,
  id: 1,
  ccid: '1082872742',
  ips: 1,
  ipsExtra: JSON.parse('[2, 3]'),
  firstname: 'Sheryl',
  lastname: 'Avendaño',
  username: 'Shers',
  password: 'ajayque',
  hostname: 'test-host',
  pid: 1,
  connected: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  operatorsAliases: false
}

const users = [
  user,
  extend(user, { id: 2, ccid: 108827292, connected: false, username: 'test' }),
  extend(user, { id: 3, ccid: 298303393 }),
  extend(user, { id: 4, ccid: 102939232, username: 'test' })
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
  byCCid: id => users.filter(a => a.ccid === id).shift(),
  byId: id => users.filter(a => a.id === id).shift(),
  byIPS: id => users.filter(a => a.ips === id).shift()
}
