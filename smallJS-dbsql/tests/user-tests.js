'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')

const userFixtures = require('./fixtures/user')
let config = {
  logging() {}
}

let AppointmentStub = {
  belongsTo: sinon.spy()
}

let id = 1
let ccid = 10
let UserStub = null
let db = null
let sandbox = null

let single = Object.assign({}, userFixtures.single)

let ccidArgs = {
  where: { ccid }
}

let newUser = {
  type: 'admin',
  id: 5,
  ccid: 14,
  name: 'Pepito Pérez',
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
  UserStub.update.withArgs(single).returns(Promise.resolve(single))

  // Model findOne Stub (with ccid)
  UserStub.findOne = sandbox.stub()
  UserStub.findOne.withArgs(ccidArgs).returns(Promise.resolve(userFixtures.byCCid(ccid)))

  // Model findById Stub
  UserStub.findById = sandbox.stub()
  UserStub.findById.withArgs(id).returns(Promise.resolve(userFixtures.byId(id)))

  const setupDatabase = proxyquire('../', {
    './models/user': () => UserStub,
    './models/appointment': () => AppointmentStub
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
  t.true(UserStub.hasMany.calledWith(AppointmentStub), 'Argument should be the AppointmentModel')
  t.true(AppointmentStub.belongsTo.called, 'AppointmentModel.belongsTo was executed')
  t.true(AppointmentStub.belongsTo.calledWith(UserStub), 'Argument should be the UserModel')
})

test.serial('User#createOrUpdate - new', async t => {
  let user = await db.User.createOrUpdate(newUser)

  t.true(UserStub.findOne.called, 'findOne should be called on model')
  t.true(UserStub.findOne.calledOnce, 'findOne should be called once')

  // Una para el ccid
  t.true(UserStub.findOne.calledWith({
  where: { ccid: newUser.ccid }
  }), 'findOne should be called with ccid args')

  t.true(UserStub.create.called, 'create should be called on model')
  t.true(UserStub.create.calledOnce, 'create should be called once')
  t.true(UserStub.create.calledWith(newUser), 'create should be called with specified args')

  t.deepEqual(user, newUser, 'user should be the same')
})

test.serial('User#createOrUpdate - exists', async t => {
  let user = await db.User.createOrUpdate(single)

  t.true(UserStub.findOne.called, 'findOne should be called on model')
  t.true(UserStub.findOne.calledTwice, 'findOne should be called twice')
  // 2 Para el ccid
  t.true(UserStub.findOne.calledWith(ccidArgs), 'findOne should be called with ccid args')

  t.true(UserStub.update.called, 'user.update called on model')
  t.true(UserStub.update.calledOnce, 'user.update should be called once')
  t.true(UserStub.update.calledWith(single), 'user.update should be called with specified args')
  t.deepEqual(user, single, 'user should be the same')
})

/* test.serial('User#findById', async t => {
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
}) */

