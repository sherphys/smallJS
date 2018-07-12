'user strict'


var login = $("#logincustomer").click(function() {
  window.location.href = "/public/html/login.html?type=customer"
})


var login = $("#logindoctor").click(function() {
  window.location.href = "/public/html/login.html?type=doctor"
})

var signup = $("#hrefsignup").click(function() {
  window.location.href = "/public/html/signup.html"
})


// Obtenemos el nombre y la cédula del cliente que inicia sesión
if(window.localStorage.getItem('checkIPS')){
    var nameGet = window.localStorage.getItem('name')
    var ccidGet = window.localStorage.getItem('ccid')
  }
else{
    var nameGet = window.sessionStorage.getItem('name')
    var ccidGet = window.sessionStorage.getItem('ccid')
}
  
$(document).ready(function(){
  $('[data-toggle="popover"]').popover();   
  $('#profile').attr("data-content","User: " + nameGet)
});
  
var buttonClose = $('#close').click(function() {
  data = {
    ccid: ccidGet
  }
  $.ajax({
    type: 'POST',
    url: 'http://localhost:3000/logout',
    data: JSON.stringify(data),
    contentType: 'application/json',
    success: function(data) {
      if(window.localStorage.getItem('checkIPS')){
        window.localStorage.removeItem('name')
        window.localStorage.removeItem('ccid')
      }
      else{
        sessionStorage.removeItem('name')
        sessionStorage.removeItem('ccid')
      }
      window.location.href = 'http://localhost:3000/'
    },
    error: function(data) {
      if (data.status == 500) {
        showalert('ERROR 500 ' + data.responseText)
      }
    }
  })
  return false
})

function showalert(data,mode){
  //En esta función podía hacer más cosas especificas 
  // tal que me mostrara los errores de una forma u otra. 
  //alert(data)
  if(mode)
  {
    swal({
      title:mode.title,
      text: data,
      icon: mode.icon,
      width: '200px'
    })
  }
  else{
    swal({
      title:"Oops!",
      text: data,
      icon: "error",
      dangerMode: true
    })
  }
}

function filedJSON(data)
{ 
  var filedItem
  for (item in data) {
    if (data[item]) filedItem=true
    else {
      filedItem=false
      break
    }
  }
  return filedItem
}

  