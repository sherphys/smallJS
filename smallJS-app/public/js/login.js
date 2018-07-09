(function() {
    console.log('Ok!')
})()

'user strict'


var buttonNew = $('#new').click(function() {
    nextStep()
    return false
})

var buttonLogin = $('#login').click(function() {
  loginUser().then(nextStep).catch(showalert)
  return false
})

var buttonRecover = $('#recover').click(function() {
  showalert("¡Estamos contruyendo!",{icon:'/public/images/alert.jpg',title:"Lo sentimos"})
  return false
})

if($('#accept').prop('checked')){
  window.localStorage.setItem('checkAgree', true)
}

if($('#remember').prop('checked')){
  window.localStorage.setItem('checkIPS', true)
}

function loginUser(){
  data = {
    password: $('#pass').val(),
    ccid: $('#ccid').val()
  }
  conditionRequired = data.password && data.ccid
  return new Promise((resolve,reject)=>{
    if (conditionRequired) {
      $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/login',
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json', // Otra forma importante ¡ESTUDIAR!
        success: function(data) {
          resolve(data)
        },
        error: function(data) {
          reject('Usuario no encontrado. ERROR 500 ' + data.responseText)
        }
      })
    }
    else reject('Datos mal ingresados')
  })
}

var buttonNewUser = $('#newuser').click(function() {
  newUser().then(nextStep).catch(showalert)    
})

function newUser(){
  data = {
    type: $('#type').val(),
    password: $('#password').val(),
    ccid: $('#ccid').val(),
    name: $('#name').val(),
    username:  $('#username').val()
  }
  conditionRequired = data.type && data.password && data.ccid && data.username && data.name && window.sessionStorage.getItem('checkAgree')
  return new Promise((resolve,reject)=>{
    if (conditionRequired) {
      $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/register',
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType:'json',
        success: function(data) {
          resolve(data)
        },
        error: function(data) {
          if (data.status == 400) {
            reject(data)
            window.location.href = 'http://localhost:3000'
          }
          if (data.status == 500) {
            reject(data)
          }
        }
      })
    }  
    else reject('Datos mal ingresados')
  })
  return false
}

function nextStep(user) {
  
  let nextstep={
    admin:'/public/html/indexadmin.html',
    doctor:'/public/html/indexdoctor.html',
    customer:'/public/html/indexcustomer.html',
    none:'public/html/signup.html'
  }

  if(user){

    if(window.localStorage.getItem('checkIPS')){
      window.localStorage.setItem('name', user.name)
      window.localStorage.setItem('ccid', user.ccid)
    }
    else{
      window.sessionStorage.setItem('name', user.name)
      window.sessionStorage.setItem('ccid', user.ccid)
      window.localStorage.removeItem('name')
      window.localStorage.removeItem('ccid')
    }
    window.location.href = nextstep[user.type]
  }
  else window.location.href = nextstep.none  
}

