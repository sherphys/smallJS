'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const userFixtures = require('./fixtures/user')
let config = {
  logging() {}
}

let ScheduleUserStub = {
  belongsTo: sinon.spy()
}

let ScheduleIPSStub = {
  belongsTo: sinon.spy()
}

let id = 1
let ccid = 10
let ips = 1
let UserStub = null
let db = null
let sandbox = null

let single = Object.assign({}, userFixtures.single)

/* let connectedArgs = {
  where: { connected: true }
}

let usernameArgs = {
  where: { username: 'Shers', connected: true }
} */

let ccidArgs = {
  where: { ccid }
}

let ipsArgs = {
  where: { ips }
}

let newUser = {
  flags:false,
  id: 2,
  ccid: 11,
  ips: 1,
  ipsExtra: JSON.parse('[2, 3]'),
  firstname: 'Pepito',
  lastname: 'Pérez',
  username: 'Pepe',
  password: 'ajayque2',
  hostname: 'test-host',
  pid: 1,
  connected: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  operatorsAliases: false
}
  test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  UserStub = {
    hasMany: sandbox.spy()
  }

  // Model create Stub
  UserStub.create = sandbox.stub()
  UserStub.create.withArgs(newUser).returns(Promise.resolve({
    toJSON() { return newUser }
  }))

  // Model update Stub
  UserStub.update = sandbox.stub()
  UserStub.update.withArgs(single, ccidArgs).returns(Promise.resolve(single))

  // Model findOne Stub (with ccid and ips)
  UserStub.findOne = sandbox.stub()
  UserStub.findOne.withArgs(ccidArgs).returns(Promise.resolve(userFixtures.byCCid(ccid)))
  UserStub.findOne.withArgs(ipsArgs).returns(Promise.resolve(userFixtures.byIPS(ips)))

  // Model findById Stub
  UserStub.findById = sandbox.stub()
  UserStub.findById.withArgs(id).returns(Promise.resolve(userFixtures.byId(id)))

  // Model findAll Stub
  UserStub.findAll = sandbox.stub()
  UserStub.findAll.withArgs().returns(Promise.resolve(userFixtures.all))
  // UserStub.findAll.withArgs(connectedArgs).returns(Promise.resolve(userFixtures.connected))
  // UserStub.findAll.withArgs(usernameArgs).returns(Promise.resolve(userFixtures.platzi))

  const setupDatabase = proxyquire('../', {
    './models/user': () => UserStub,
    './models/scheduleuser': () => ScheduleUserStub,
    './models/scheduleips': () => ScheduleIPSStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test('User', t => {
  t.truthy(db.User, 'User service should exist')
})

test.serial('Setup', t => {
  t.true(UserStub.hasMany.called, 'UserModel.hasMany was executed')
  t.true(UserStub.hasMany.calledWith(ScheduleUserStub), 'Argument should be the ScheduleUserModel')
  t.true(ScheduleUserStub.belongsTo.called, 'SheduleUserModel.belongsTo was executed')
  t.true(ScheduleUserStub.belongsTo.calledWith(UserStub), 'Argument should be the UserModel')
  t.true(ScheduleIPSStub.belongsTo.called, 'SheduleIPSModel.belongsTo was executed')
  t.true(ScheduleIPSStub.belongsTo.calledWith(UserStub, {as: 'ips'}), 'Argument should be the UserModel')
})

test.serial('User#findById', async t => {
  let user = await db.User.findById(id)

  t.true(UserStub.findById.called, 'findById should be called on model')
  t.true(UserStub.findById.calledOnce, 'findById should be called once')
  t.true(UserStub.findById.calledWith(id), 'findById should be called with specified id')
  t.deepEqual(user, userFixtures.byId(id), 'should be the same')
})

test.serial('User#findByCCid', async t => {
  let user = await db.User.findByCCid(ccid)

  t.true(UserStub.findOne.called, 'findOne should be called on model')
  t.true(UserStub.findOne.calledOnce, 'findOne should be called once')
  t.true(UserStub.findOne.calledWith(ccidArgs), 'findOne should be called with ccid args')
  t.deepEqual(user, userFixtures.byCCid(ccid), 'user should be the same')
})

test.serial('User#findByIPS', async t => {
  let user = await db.User.findByIPS(ips)

  t.true(UserStub.findOne.called, 'findOne should be called on model')
  t.true(UserStub.findOne.calledOnce, 'findOne should be called twice')
  t.true(UserStub.findOne.calledWith(ipsArgs), 'findOne should be called with ips args')
  t.deepEqual(user, userFixtures.byIPS(ips), 'should be the same')
})

 test.serial('User#createOrUpdate - new', async t => {
  let user = await db.User.createOrUpdate(newUser)

  t.true(UserStub.findOne.called, 'findOne should be called on model')
  t.true(UserStub.findOne.calledTwice, 'findOne should be called once')

  // Una para el ccid
  t.true(UserStub.findOne.calledWith({
  where: { ccid: newUser.ccid }
  }), 'findOne should be called with ccid args')

  // Una para la ips
  t.true(UserStub.findOne.calledWith({
  where: { ips: newUser.ips }
  }), 'findOne should be called with ccid args')

  t.true(UserStub.create.called, 'create should be called on model')
  t.true(UserStub.create.calledOnce, 'create should be called once')
  t.true(UserStub.create.calledWith(newUser), 'create should be called with specified args')

  t.deepEqual(user, newUser, 'agent should be the same') 
})

  test.serial('User#createOrUpdate - exists', async t => {
  let user = await db.User.createOrUpdate(single)

  t.true(UserStub.findOne.called, 'findOne should be called on model')
  t.true(UserStub.findOne.calledThrice, 'findOne should be called twice')
  // 2 Para el ccid
  t.true(UserStub.findOne.calledWith(ccidArgs), 'findOne should be called with ccid args')
  t.true(UserStub.findOne.calledWith(ipsArgs), 'findOne should be called with ips args')  

  t.true(UserStub.update.called, 'agent.update called on model')
  t.true(UserStub.update.calledOnce, 'agent.update should be called once')
  t.true(UserStub.update.calledWith(single), 'agent.update should be called with specified args')

  t.deepEqual(user, single, 'agent should be the same')
}) 

/* test.serial('Agent#findAll', async t => {
  let agents = await db.Agent.findAll()

  t.true(UserStub.findAll.called, 'findAll should be called on model')
  t.true(UserStub.findAll.calledOnce, 'findAll should be called once')
  t.true(UserStub.findAll.calledWith(), 'findAll should be called without args')

  t.is(agents.length, agentFixtures.all.length, 'agents should be the same amount')
  t.deepEqual(agents, agentFixtures.all, 'agents should be the same')
}) */

/* test.serial('Agent#findConnected', async t => {
  let agents = await db.Agent.findConnected()

  t.true(UserStub.findAll.called, 'findAll should be called on model')
  t.true(UserStub.findAll.calledOnce, 'findAll should be called once')
  t.true(UserStub.findAll.calledWith(connectedArgs), 'findAll should be called with connected args')

  t.is(agents.length, agentFixtures.connected.length, 'agents should be the same amount')
  t.deepEqual(agents, agentFixtures.connected, 'agents should be the same')
}) */

/* test.serial('Agent#findByUsername', async t => {
  let agents = await db.Agent.findByUsername('platzi')

  t.true(UserStub.findAll.called, 'findAll should be called on model')
  t.true(UserStub.findAll.calledOnce, 'findAll should be called once')
  t.true(UserStub.findAll.calledWith(usernameArgs), 'findAll should be called with username args')

  t.is(agents.length, agentFixtures.platzi.length, 'agents should be the same amount')
  t.deepEqual(agents, agentFixtures.platzi, 'agents should be the same')
}) */



