'use strict'

const test = require('ava')
const sinon = require('sinon')
const proxyquire = require('proxyquire')
const Sequelize = require('sequelize')
const Op = Sequelize.Op

const appointmentFixtures = require('./fixtures/appointment')

let config = {
  logging() {}
}

let UserStub = null
let AppointmentStub = null
let db = null
let sandbox = null

let customer = Object.assign({}, appointmentFixtures.user)
let doctor = Object.assign({}, appointmentFixtures.docuser)
let oneAppointment = Object.assign({}, appointmentFixtures.oneapp)
let changeAppointment = Object.assign({}, appointmentFixtures.upapp)
let canceledAppointment = Object.assign({}, appointmentFixtures.allapp[1])

let appointmentid = oneAppointment.id
let userid = doctor.id
let ccid = doctor.ccid

let ccidchange = customer.ccid

let vArgs = {
  where:{
    id:oneAppointment.id,
    userId:oneAppointment.userId
  }
}

let ccidArgs = {
  where: { ccid }
}

let ccidArgsCustomer = {
  where: {
    ccid:ccidchange,
    type:'customer'
  }
}

let ccidArgsCustomerOrAdmin = {
  where: {
    ccid:ccidchange,
    type:'customer'
  }
}

let newAppointment = {
  id:5,
  userId:2,
  day: '2018-06-28',
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

let dayinit = '2018-06-20'
let dayend = '2018-06-24'

// UserStub = {
//  hasMany: sinon.spy()
// }
let daysArgs = {
  where: {
    day:{
      [Op.lt]: dayinit,
      [Op.gt]: dayend
    },
    state:1
  }
}

// let changeAppointment = appointmentFixtures.extend(oneAppointment,assign)

test.beforeEach(async () => {
  sandbox = sinon.createSandbox()

  UserStub = {
    hasMany: sandbox.spy()
  }

  AppointmentStub = {
    belongsTo: sandbox.spy()
  }

  // Model create and update Stub
  AppointmentStub.create = sandbox.stub()
  AppointmentStub.create.withArgs(newAppointment).returns(Promise.resolve({
    toJSON() { return newAppointment }
  }))

  AppointmentStub.update = sandbox.stub()
  AppointmentStub.update.withArgs(oneAppointment).returns(Promise.resolve(oneAppointment))
  AppointmentStub.update.withArgs(changeAppointment).returns(Promise.resolve(changeAppointment))

  AppointmentStub.findById = sandbox.stub()
  AppointmentStub.findById.withArgs(oneAppointment.id).returns(Promise.resolve(appointmentFixtures.byId(oneAppointment.id)))
  AppointmentStub.findById.withArgs(changeAppointment.id).returns(Promise.resolve(appointmentFixtures.byId(changeAppointment.id)))
  // Model findOne Stub (with ccid)

  AppointmentStub.findOne = sandbox.stub()
  AppointmentStub.findOne.withArgs(vArgs).returns(Promise.resolve(appointmentFixtures.byrel(appointmentid, userid)))

  // Model findOne Stub (with ccid)

  UserStub.findOne = sandbox.stub()
  UserStub.findOne.withArgs(ccidArgs).returns(Promise.resolve(appointmentFixtures.byCCid(ccid)))
  UserStub.findOne.withArgs(ccidArgsCustomer).returns(Promise.resolve(appointmentFixtures.byCCidCustomer(ccidchange)))
  UserStub.findOne.withArgs(ccidArgsCustomerOrAdmin).returns(Promise.resolve(appointmentFixtures.byCCidCustomerOrAdmin(ccidchange)))


  AppointmentStub.findAll = sandbox.stub()
  AppointmentStub.findAll.withArgs(daysArgs).returns(Promise.resolve(appointmentFixtures.bydays(dayinit, dayend)))

  // Model findById Stub
  // UserStub.findById = sandbox.stub()
  // UserStub.findById.withArgs(id).returns(Promise.resolve(userFixtures.byId(id))) */

  const setupDatabase = proxyquire('../', {
    './models/user': () => UserStub,
    './models/appointment': () => AppointmentStub
  })

  db = await setupDatabase(config)
})

test.afterEach(() => {
  sandbox && sandbox.restore()
})

test('Appointment', t => {
  t.truthy(db.Appointment, 'Appointment service should exist')
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

test.serial('Appointmet#createOrUpdate - new - user - doctor', async t => {
  let appointment = await db.Appointment.createOrUpdate(ccid, newAppointment)

  // Primero buscamos el usuario
  t.true(UserStub.findOne.called, 'findOne (user) should be called on model')
  t.true(UserStub.findOne.calledOnce, 'findOne (user) should be called twice')
  t.true(UserStub.findOne.calledWith(ccidArgs), 'findOne (user) should be called with ccid args')

  // Luego buscamos la cita
  t.true(AppointmentStub.findOne.called, 'findOne (appoint) should be called on model')
  t.true(AppointmentStub.findOne.calledOnce, 'findOne (appoint) should be called once')
  t.true(AppointmentStub.findOne.calledWith({
    where:{
      id:newAppointment.id,
      userId:newAppointment.userId
    }
  }), 'findOne (appoint) should be called with vargs')

  // Luego creamos la cita
  t.true(AppointmentStub.create.called, 'appointment.create called on model')
  t.true(AppointmentStub.create.calledOnce, 'appointment.create should be called once')
  t.true(AppointmentStub.create.calledWith(newAppointment), 'appointment.create should be called with specified args')
  t.deepEqual(appointment, newAppointment, 'appointment should be the same')
})

test.serial('Appointmet#createOrUpdate - exist - user - doctor', async t => {
  let appointment = await db.Appointment.createOrUpdate(ccid, oneAppointment)

  // Primero buscamos el usuario
  t.true(UserStub.findOne.called, 'findOne (user) should be called on model')
  t.true(UserStub.findOne.calledOnce, 'findOne (user) should be called twice')
  t.true(UserStub.findOne.calledWith(ccidArgs), 'findOne (user) should be called with ccid args')

  // Luego buscamos la cita (que ya existe)
  t.true(AppointmentStub.findOne.called, 'findOne (appoint) should be called on model')
  t.true(AppointmentStub.findOne.calledOnce, 'findOne (appoint) should be called twice')
  t.true(AppointmentStub.findOne.calledWith(vArgs), 'findOne (appoint) should be called with vargs')

  // Volvemos a buscarlas por el id
  t.true(AppointmentStub.findById.called, 'findById (appoint) should be called on model')
  t.true(AppointmentStub.findById.calledOnce, 'findById (appoint) should be called twice')
  t.true(AppointmentStub.findById.calledWith(oneAppointment.id), 'findById (appoint) should be called with vargs')

  // Al encontrarla, la actualizamos
  t.true(AppointmentStub.update.called, 'appointment.update called on model')
  t.true(AppointmentStub.update.calledOnce, 'appointment.update should be called once')
  t.true(AppointmentStub.update.calledWith(oneAppointment), 'appointment.update should be called with specified args')

  t.deepEqual(appointment, oneAppointment, 'appointment should be the same')
})

test.serial('Appointment#findNoAssignedByDate', async t => {
  let appointments = await db.Appointment.findNoAssignedByDate(dayinit, dayend)

  // Buscamos con un alll
  t.true(AppointmentStub.findAll.called, 'findOne should be called on model')
  t.true(AppointmentStub.findAll.calledOnce, 'findOne should be called twice')
  t.true(AppointmentStub.findAll.calledWith(daysArgs), 'findOne should be called with ccid args')

  t.is(appointments.length, appointmentFixtures.bydays(dayinit, dayend).length, 'agents should be the same amount')
  t.deepEqual(appointments, appointmentFixtures.bydays(dayinit, dayend), 'agents should be the same')
})

test.serial('Appointmet#AssignedAndUpdate - exist - user - customer', async t => {
  let appointment = await db.Appointment.assignedAndUpdate(ccidchange, canceledAppointment)

  // Primero buscamos el usuario
  t.true(UserStub.findOne.called, 'findOne (user) should be called on model')
  t.true(UserStub.findOne.calledOnce, 'findOne (user) should be called twice')
  t.true(UserStub.findOne.calledWith(ccidArgsCustomerOrAdmin), 'findOne (user) should be called with ccid args')

  // Volvemos a buscarlas por el id
  t.true(AppointmentStub.findById.called, 'findById (appoint) should be called on model')
  t.true(AppointmentStub.findById.calledTwice, 'findById (appoint) should be called twice')
  t.true(AppointmentStub.findById.calledWith(changeAppointment.id), 'findById (appoint) should be called with vargs')

  // console.log('El total de los usuario es: ' +  JSON.stringify(appointmentFixtures.extend(oneAppointment,
  //  assign)) + '\n\n')

  // Al encontrarla, la actualizamos
  t.true(AppointmentStub.update.called, 'appointment.update called on model')
  t.true(AppointmentStub.update.calledOnce, 'appointment.update should be called once')
  t.true(AppointmentStub.update.calledWith(changeAppointment), 'appointment.update should be called with specified args')

  t.deepEqual(appointment, changeAppointment, 'appointment should be the same')
})

test.serial('Appointmet#CanceledAndUpdate - exist - user/admin - customer', async t => {
  let appointment = await db.Appointment.assignedAndUpdate(ccidchange, canceledAppointment)

  // Primero buscamos el usuario
  t.true(UserStub.findOne.called, 'findOne (user) should be called on model')
  t.true(UserStub.findOne.calledOnce, 'findOne (user) should be called twice')
  t.true(UserStub.findOne.calledWith(ccidArgsCustomerOrAdmin), 'findOne (user) should be called with ccid args')

  // Volvemos a buscarlas por el id
  t.true(AppointmentStub.findById.called, 'findById (appoint) should be called on model')
  t.true(AppointmentStub.findById.calledTwice, 'findById (appoint) should be called twice')
  t.true(AppointmentStub.findById.calledWith(canceledAppointment.id), 'findById (appoint) should be called with vargs')

  // console.log('El total de los usuario es: ' +  JSON.stringify(appointmentFixtures.extend(oneAppointment,
  //  assign)) + '\n\n')

  // Al encontrarla, la actualizamos
  t.true(AppointmentStub.update.called, 'appointment.update called on model')
  t.true(AppointmentStub.update.calledOnce, 'appointment.update should be called once')
  t.true(AppointmentStub.update.calledWith(canceledAppointment), 'appointment.update should be called with specified args')

  t.deepEqual(appointment, canceledAppointment, 'appointment should be the same')
})
