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

  if(section.id) {
    switch(section.id) {
      case "find":
        $("#findapp").removeClass("disabled")
      break
      case "revised":
        $("#revisedapp").removeClass("disabled")
      break
      case "modifiqued":
        $("#canceledapp").removeClass("disabled")
      break
    }
  }

var redirect = $('.filter').click(function() {
  var id = $(this).attr('id')
  window.location.href=`/public/html/filter.html?id=${id}`  
  return false
})

var buttonCanceled= $('#canceledapp').click(function() {
  tablerevised("Cancelar cita").then(appoitmentCanceled).catch(showalert)    
  return false
})
var buttonRevised = $('#revisedapp').click(function() {
  tablerevised().then(tablemakeonly).catch(showalert)    
  return false
})

var buttonFind = $('#findapp').click(function() {
  tablecallback("Reservar cita").then(appoitmentAssigned).catch(showalert)    
  return false
})

var bfindredirect = $('#back').click(function() {
  window.location.href='/public/html/indexcustomer.html'
  return false
})


function tablecallback(msj){
  data = {
    dayinit: $('#dayinit').val(),
    dayend: $('#dayend').val() || $('#dayinit').val(),
    operatorsAliases: false
  }
  conditionRequired = data.dayinit && data.dayend
  DateInit = new Date(data.dayinit)
  DateEnd = new Date(data.dayend)
  conditionTime = DateInit <= DateEnd
    return new Promise((resolve,reject)=>{
      if(conditionRequired && conditionTime){
      $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/appointments/free',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(data) {
          tablemake(data)
          $(".bapp").append(msj)
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
            reject('ERROR 500 ' + data.responseText)    
          }
        }
      })
    }
    else reject("Datos mal ingresados")
  })
}

function tablemake(data) {
  var rowTable = '<tr> \n  <th>Día</th> \n  <th>Inicio</th> \n  <th>Finalización</th> \n  <th>Ubicación</th> \n  <th>Doctor</th>\n <th>Tipo</th> \n <th>Reservar</th> </tr>'
  branch = {1:'Primaria', 2:'Secundaria', 3:'Terciaria'}
  for (i = 0; i < data.length; i++) {
    rowTable += '\n <tr> \n <td> ' + data[i].day + ' </td> \n <td> ' + data[i].hourinit + ' </td> \n <td> '
    + data[i].hourend + ' </td> \n <td> ' + branch[data[i].branch] + ' </td> \n <td> ' + data[i].doctorname + ' </td> \n <td> ' +
    data[i].type + ' </td> <td> <button class="btn btn-primary bapp" id='+data[i].id+'></button> </td> </tr>'
  }
  $('#myTable').html(rowTable)
}
function cleantable(){
  var rowTable =""
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
      showalert(data,{title:"Listo",icon:"success"})
      cleantable()
    },
    error: function(data) {
      if (data.status == 500) {
        showalert('ERROR 500 ' + data.responseText)    
      }
    }
  })
  return false
}

function appoitmentCanceled(data) {
  $.ajax({
    type: 'POST',
    url: 'http://localhost:3000/appointments/cancel',
    data: JSON.stringify(data),
    contentType: 'application/json',
    success: function(data) { 
      showalert(data,{title:"Listo",icon:"success"})
      cleantable()
    },
    error: function(data) {
      if (data.status == 500) {
        showalert('ERROR 500 ' + data.responseText)    
      }
    }
  })
  return false
}

function tablerevised(msj){
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
    return new Promise((resolve,reject)=>{
      $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/appointments/assign',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(data) {
          if(msj){
            tablemake(data)
            $(".bapp").append(msj)
            $('.bapp').click(function() {
              var id = $(this).attr('id')
              response={
                id:id,
                ccid:ccidGet
              }
              resolve(response)
            })    
          }
          else resolve(data)
        },
        error: function(data) {
          if (data.status == 500) {
            reject('ERROR 500 ' + data.responseText)    
          }
        }
      })
    })
  }
  else alert("Datos mal ingresados")
}




