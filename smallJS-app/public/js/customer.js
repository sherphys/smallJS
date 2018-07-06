(function() {
    console.log('Ok!')
})()

'user strict'

var section = {}
location.search
  .replace("?", "")
  .split("&")
  .forEach(q => {
    const [k,v] = q.split("=")
    section[k] = v
  })

  $

  if(section.id) {
    switch(section.id) {
      case "modifiqued":
        $("#canceleddapp").removeClass("disabled")
        break
    }
  }

var nameGet = window.sessionStorage.getItem('name')
var ccidGet = window.sessionStorage.getItem('ccid')
$('#title').replaceWith('NOMBRE: ' + nameGet + ' CC: ' + ccidGet)


var bredirect = $('.bredir').click(function() {
  var id = $(this).attr('id')

  switch(id)
  {
    case 'close' : 
      sessionStorage.clear()
      //window.location.href = 'http://localhost:3000/'
      break
    default: window.location.href=`/public/html/filter.html?id=${id}`
  }
  return false
})

var brevised = $('#reviseapp').click(function() {
  tablerevised().then(tablemakeonly)    
  return false
})

var bfind = $('#findapp').click(function() {
  tablecallback().then(appoitmentAssigned)    
  return false
})

var bfindredirect = $('#back').click(function() {
  window.location.href='/public/html/indexcustomer.html'
  return false
})


function tablecallback(){
  data = {
    dayinit: $('#dayinit').val(),
    dayend: $('#dayend').val() || $('#dayinit').val(),
    operatorsAliases: false
  }
  conditionRequired = data.dayinit && data.dayend
  DateInit = new Date(data.dayinit)
  DateEnd = new Date(data.dayend)
  conditionTime = DateInit <= DateEnd
  if(conditionRequired && conditionTime){
    return new Promise((resolve)=>{
      $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/appointments/free',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(data) {
          tablemake(data)
          $('.bapp').click(function() {
            var id = $(this).attr('id')
            response={
              id:id,
              ccid:ccidGet
            }
            resolve(response)
          })    
        },
        error: function(data) {
          if (data.status == 500) {
            alert('ERROR 500 ' + data.responseText)    
          }
        }
      })
    })
  }
  else alert("Datos mal ingresados")
}

function tablemake(data) {
  var rowTable = '<tr> \n  <th>Día</th> \n  <th>Inicio</th> \n  <th>Finalización</th> \n  <th>Ubicación</th> \n  <th>Doctor</th>\n <th>Tipo</th> \n <th>Reservar</th> </tr>'
  branch = {1:'Primaria', 2:'Secundaria', 3:'Terciaria'}
  for (i = 0; i < data.length; i++) {
    rowTable += '\n <tr> \n <td> ' + data[i].day + ' </td> \n <td> ' + data[i].hourinit + ' </td> \n <td> '
    + data[i].hourend + ' </td> \n <td> ' + branch[data[i].branch] + ' </td> \n <td> ' + data[i].doctorname + ' </td> \n <td> ' +
    data[i].type + ' </td> <td> <button class=bapp id='+data[i].id+'>Reservar cita</button> </td> </tr>'
  }
  $('#myTable').html(rowTable)
}
function tablemakeonly(data) {
  var rowTable = '<tr> \n  <th>Día</th> \n  <th>Inicio</th> \n  <th>Finalización</th> \n  <th>Ubicación</th> \n  <th>Doctor</th>\n <th>Tipo</th> </tr>'
  branch = {1:'Primaria', 2:'Secundaria', 3:'Terciaria'}
  for (i = 0; i < data.length; i++) {
    rowTable += '\n <tr> \n <td> ' + data[i].day + ' </td> \n <td> ' + data[i].hourinit + ' </td> \n <td> '
    + data[i].hourend + ' </td> \n <td> ' + branch[data[i].branch] + ' </td> \n <td> ' + data[i].doctorname + ' </td> \n <td> ' +
    data[i].type + ' </td> </tr>'
  }
  $('#myTable').html(rowTable)
}
function appoitmentAssigned(data) {
  $.ajax({
    type: 'POST',
    url: 'http://localhost:3000/appointments/nofree',
    data: JSON.stringify(data),
    contentType: 'application/json',
    success: function(data) { 
      console.log(JSON.stringify(data))
      window.location.href='/public/html/filter.html'
    },
    error: function(data) {
      if (data.status == 500) {
        alert('ERROR 500 ' + data.responseText)    
      }
    }
  })
  return false
}

function tablerevised(){
  data = {
    ccid: ccidGet,
    dayinit: $('#dayinit').val(),
    dayend: $('#dayend').val() || $('#dayinit').val(),
    operatorsAliases: false
  }
  conditionRequired = data.dayinit && data.dayend
  DateInit = new Date(data.dayinit)
  DateEnd = new Date(data.dayend)
  conditionTime = DateInit <= DateEnd
  if(conditionRequired && conditionTime){
    return new Promise((resolve)=>{
      $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/appointments/assign',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(data) {
          resolve(data)
        },
        error: function(data) {
          if (data.status == 500) {
            alert('ERROR 500 ' + data.responseText)    
          }
        }
      })
    })
  }
  else alert("Datos mal ingresados")
}




