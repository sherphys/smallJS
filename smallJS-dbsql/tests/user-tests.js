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
let ccid = '1082872742'
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

let condips = {
  where: { ips:1 }
}

let newUser = {
  flags:false,
  id: 2,
  ccid: '333333333',
  ips: 1,
  ipsExtra: JSON.parse('[2, 3]'),
  firstname: 'Sheryl',
  lastname: 'Avendaño',
  username: 'Shers',
  password: 'ajayque',
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

  // Model findOne Stub
  UserStub.findOne = sandbox.stub()
  UserStub.findOne.withArgs(ccidArgs).returns(Promise.resolve(userFixtures.byCCid(ccid)))

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
  t.true(ScheduleIPSStub.belongsTo.calledWith(UserStub, {as: 'IPS'}), 'Argument should be the UserModel')
})

test.serial('Agent#findById', async t => {
  let user = await db.User.findById(id)

  t.true(UserStub.findById.called, 'findById should be called on model')
  t.true(UserStub.findById.calledOnce, 'findById should be called once')
  t.true(UserStub.findById.calledWith(id), 'findById should be called with specified id')
  t.deepEqual(user, userFixtures.byId(id), 'should be the same')
})

test.serial('Agent#findOne', async t => {
  let user = await db.User.findOne(condips)

  t.true(UserStub.findOne.called, 'findOne should be called on model')
  t.true(UserStub.findOne.calledTwice, 'findOne should be called twice')
  //t.true(UserStub.findOne.calledWith(condips), 'findOne should be called with uuid args')
  //t.deepEqual(user, userFixtures.byIPS(ips), 'should be the same')
})

/* test.serial('Agent#findByUuid', async t => {
  let agent = await db.Agent.findByUuid(uuid)

  t.true(UserStub.findOne.called, 'findOne should be called on model')
  t.true(UserStub.findOne.calledOnce, 'findOne should be called once')
  t.true(UserStub.findOne.calledWith(uuidArgs), 'findOne should be called with uuid args')

  t.deepEqual(agent, agentFixtures.byUuid(uuid), 'agent should be the same')
}) */

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

/* test.serial('Agent#createOrUpdate - exists', async t => {
  let user = await db.User.createOrUpdate(single)

  t.true(UserStub.findOne.called, 'findOne should be called on model')
  t.true(UserStub.findOne.calledTwice, 'findOne should be called twice')
  t.true(UserStub.findOne.calledWith(ccidArgs), 'findOne should be called with uuid args')
  t.true(UserStub.update.called, 'agent.update called on model')
  t.true(UserStub.update.calledOnce, 'agent.update should be called once')
  t.true(UserStub.update.calledWith(single), 'agent.update should be called with specified args')

  t.deepEqual(user, single, 'agent should be the same')
}) */

/* test.serial('User#createOrUpdate - new', async t => {
  let user = await db.User.createOrUpdate(newUser)

  t.true(UserStub.findOne.called, 'findOne should be called on model')
  t.true(UserStub.findOne.calledOnce, 'findOne should be called once')

  // t.true(UserStub.findOne.calledWith({
  // where: { ccid: newUser.ccid }
  // }), 'findOne should be called with ccid args')

  t.true(UserStub.create.called, 'create should be called on model')
  t.true(UserStub.create.calledOnce, 'create should be called once')
  t.true(UserStub.create.calledWith(newUser), 'create should be called with specified args')

  t.deepEqual(user, newUser, 'agent should be the same')
}) */
