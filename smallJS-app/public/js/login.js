(function() {
    console.log('Ok!')
})()

'user strict'

var href={
  adminlogin:"http://localhost:3000/admin",
  adminsignup:"http://localhost:3000/admin/signup"
}
var section = {}

location.search
  .replace("?", "")
  .split("&")
  .forEach(q => {
    const [k,v] = q.split("=")
    section[k] = v
  })

if(window.location.href===href.adminlogin || window.location.href===href.adminsignup)
{
  $(".navbar-btn").addClass("disabled")
  section.type="admin"
}

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

var checkAgree = $('#accept').click( function(){
  if($(this).prop('checked')) window.sessionStorage.setItem('checkAgree', true)
  else window.sessionStorage.setItem('checkAgree', false)
})

var checkRemember = $('#remember').click( function(){
  if($(this).prop('checked')) window.localStorage.setItem('checkIPS', true)
  else window.localStorage.setItem('checkIPS', false)
})

var showpassword = $(".toggle-password").click(function() {
  $(this).toggleClass("glyphicon glyphicon-eye-open glyphicon glyphicon-eye-close");
  var input = $($(this).attr("toggle"));
  if (input.attr("type") == "password") {
    input.attr("type", "text");
  } else {
    input.attr("type", "password");
  }
});

function loginUser(){
  data = {
    password: $('#password').val(),
    ccid: $('#ccid').val(),
    type: section.type 
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
        /*beforeSend: function (xhr) {   //Include the bearer token in header
          xhr.setRequestHeader("Authorization", 'Bearer '+ jwt);
        },*/
        //headers: {"Authorization": localStorage.getItem('token')},
        success: function(data) {
          alert(JSON.stringify(data.token))
          //resolve(data)
        },
        error: function(data) {
          if(data.status===500) reject('ERROR 500 ' + data.responseText)
          if(data.status===400) reject('ERROR 400 ' + data.responseText)
        }
      })
    }
    else reject('Datos mal ingresados')
  })
}

var buttonNewUser = $('#newuser').click(function() {
  newUser()
  return false
})

function newUserPromise(data) {
  return  new Promise((resolve,reject)=>{ 
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
          reject(data.responseText)
          window.location.href = 'http://localhost:3000'
        }
        if (data.status == 500) {
          reject(data.responseText)
        }
      }
    }) 
  })
}

function showConfirm(data,confirm){
  return new Promise(resolve =>{
    swal(confirm).then( password =>{
    data["confirm"]=password
    resolve(data)
    })
  })
}

function newUser(data){ 
  
  data = {
    password: $('#password').val(),
    ccid: $('#ccid').val(),
    name: $('#name').val(),
    username:  $('#username').val()
  }

  let confirm ={
    title:"Esta intentando crear un usuario tipo Administrador",
    content: {
      element: "input",
      attributes: {
        placeholder: "Escribir la contraseña",
        type: "password",
      },
    },
    icon: "warning",
    button: {
      cancel: true,
      confirm: "Confirmar",
      closeModal: false,
    },
  }
  conditionRequired = filedJSON(data) && window.sessionStorage.getItem('checkAgree')
  if(window.location.href===href.adminsignup) data['type']=section.type
  else data['type']=''
  if (conditionRequired) {
    if(data.type==="admin") showConfirm(data,confirm).then(newUserPromise).then(nextStep,showalert)
    else newUserPromise(data).then(nextStep).catch(showalert)  
  }  
  else showalert('Datos mal ingresados')
  return false
}

function nextStep(user) {
  
  let nextstep={
    admin:'/public/html/indexadmin.html',
    doctor:'/public/html/indexdoctor.html',
    customer:'/public/html/indexcustomer.html',
    none:'/public/html/signup.html',
    home:"http://localhost:3000"
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
    if(user.connected) window.location.href = nextstep[user.type]
    else {
      showalert("Usuario registrado",{title:"Good!",icon:"success"})
      window.location.href = "http://localhost:3000"
    }
  }
  else window.location.href = nextstep.none  
}

