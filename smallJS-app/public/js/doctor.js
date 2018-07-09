(function() {
    console.log('Ok!')
})()

'user strict'


// Sí se hace click en nueva cita se carga el archivo appointment.html en el sector indicado
let buttonNew = $('#new_app').click(function() {
  let range ={
    delta:['00','20','40'],
    limDown:9,
    limUp:18
  } 
  loadValideDateAndCreationApp(range)
  return false
})

function loadValideDateAndCreationApp(range){
    $('#space').load('/public/html/appointment.html', function() {
      $(document).ready(function() {
        $('#day').change(function() {
          let changeday = $(this)
          if (changeday) {
            filterValidateTime($('#day').val(),range).then(listHourInitAndEnd).catch(showalert)
          }
        })
      })
      appointmentCreation()
  })
}

function filterValidateTime(choosenday,range) {
  data = {
    day: choosenday,
    doctorname: nameGet
  }
  return new Promise((resolve,reject)=>{
    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/valide',
      data: JSON.stringify(data),
      contentType: 'application/json',
      dataType: 'json',
      success: function(data) {
        let hourinit = []
        let hourend = []
        for (let i = 0; i < data.length; i++){
          hourinit[i] = data[i].hourinit
          hourend[i] = data[i].hourend
        }
        let finalData={
          hourinit,
          hourend,
          init:range.limDown,
          end:range.limUp,
          width:range.delta.length,
          nlength:(range.limUp-range.limDown),
          delta:range.delta
        }
        resolve(finalData)
      },
      error: function(data) {
        if (data.status == 500) {
          reject('ERROR 500 ' + data.responseText)
        }
      }
    })
  })
}

function listHourInitAndEnd(finalData) {
  let selectionInit = ''
  let selectionEnd = '' 
  
  let listInitEnd = timeListInitAndEnd(finalData)
  let listInit=listInitEnd[0]
  let listEnd=listInitEnd[1]

  for (i = 0; i < listInit.length; i++) {
    selectionInit += "<option value='" + listInit[i] + "'>" + listInit[i] + '</option>'
    selectionEnd += "<option value='" + listEnd[i] + "'>" + listEnd[i] + '</option>'
  }
  $('#hourinit').html(selectionInit)
  $('#hourend').html(selectionEnd)
  $('#hourinit').removeAttr('disabled')
  $('#hourend').removeAttr('disabled')
  
}
function timeListInitAndEnd(finalData) {
  let list = []
  let k = 0

  for (let i = 0; i < finalData.nlength+1; i++) {
    for (let j = 0; j < finalData.width; j++) {
      list[k] = zeroFill(finalData.init + i, 2) + ':' + finalData.delta[j] + ':00'
      k = k + 1
    }
  }

  let listcopy = [[],[]]
  listcopy[0] = list.slice(0, list.length - 3)
  listcopy[1] = list.slice(1, list.length - 2)
  listcopy[0]=listcopy[0].filter((number) => { return finalData.hourinit.indexOf(number) == -1 })
  listcopy[1]=listcopy[1].filter((number) => { return finalData.hourend.indexOf(number) == -1 })

  return filterchain(listcopy)
}
function filterchain(listcopy)
{

  let listInitEnd=[[],[]]
  listInitEnd[0] = listcopy[0].filter((number) => { return (listcopy[1].indexOf(number) - listcopy[0].indexOf(number) != 0) })
  listInitEnd[1] = listcopy[1].filter((number) => { return (listcopy[1].indexOf(number) - listcopy[0].indexOf(number) != 0) })
  
  return listInitEnd
}

function zeroFill(number, width)  {
  width -= number.toString().length
  if (width > 0)    {
    return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number
  }
  return number + '' // always return a string
}

function appointmentCreation() {
  $('#creation').click(function() {
    data = {
      type: $('#type').val(),
      day: $('#day').val(),
      hourinit: $('#hourinit').val(),
      hourend: $('#hourend').val(),
      branch: $('#branch').val(),
      ccid: ccidGet,
      doctorname: nameGet
    }
    conditionRequired = data.type && data.day && data.hourinit && data.hourend && data.branch
    DateInit = new Date(data.day + ' ' + data.hourinit)
    DateEnd = new Date(data.day + ' ' + data.hourend)
    conditionTime = DateInit < DateEnd
      if (conditionRequired && conditionTime) {
      $.ajax({
        type: 'POST',
        url: 'http://localhost:3000/appointments',
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function(data) {
          let ask = (question, yes, no) => {
            (confirm(question)) ? yes() : no()
          }
          ask('La cita fue guardada con éxito. ¿Desea registrar otra cita?',
          () => { $('#new_app').click() },
          () => { window.location.href = '/public/html/indexdoctor.html' })
          },
          error: function(data) {
          if (data.status == 500) {
            alert('ERROR 500 ' + data.responseText)
          }
        }
      })
    } else alert('Datos mal ingresados')
    return false
  })
}

var buttonRevised = $('#revised').click(function() {
  data = {
    ccid: ccidGet,
    doctorname: nameGet
  }
  $.ajax({
    type: 'POST',
    url: 'http://localhost:3000/appointments/all',
    data: JSON.stringify(data),
    contentType: 'application/json',
    dataType: 'json',
    success: function(data) {
      tablemake(data)
    },
    error: function(data) {
      if (data.status == 500) {
        alert('ERROR 500 ' + data.responseText)
      }
    }
  })
  return false
})

function tablemake(data) {
  var rowTable = '<h1> TODAS LAS CITAS </h1> <table class="table table-hover"> <tr> \n  <th>Día</th> \n  <th>Inicio</th> \n  <th>Finalización</th> \n  <th>Ubicación</th> \n  <th>Asignada a</th>\n <th>CC del paciente</th></tr>'
  branch = {1:'Primaria', 2:'Secundaria', 3:'Terciaria'}
  for (i = 0; i < data.length; i++) {
    rowTable += '\n <tr> \n <td> ' + data[i].day + ' </td> \n <td> ' + data[i].hourinit + ' </td> \n <td> '
    + data[i].hourend + ' </td> \n <td> ' + branch[data[i].branch] + ' </td> \n <td> ' + data[i].assignedname + ' </td> \n <td> ' +
    data[i].assignedid + ' </td> </tr>'
  }
 rowTable=rowTable+"</table>"
  $('#space').html(rowTable)
}

/*var buttonModifiqued = $('#modifiqued').click(function() {

})*/


