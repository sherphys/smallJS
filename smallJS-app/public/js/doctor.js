(function() {
    console.log('Ok!')
})()

'user strict'

// Obtenemos el nombre y la cédula del ciente que inicia sesión

var nameGet = window.sessionStorage.getItem('name')
var ccidGet = window.sessionStorage.getItem('ccid')
$('#title').replaceWith('NOMBRE: ' + nameGet + ' CC: ' + ccidGet)

// Sí se hace click en nueva cita se carga el archivo appointment.html en el sector indicado
var bnew = $('#new_app').click(function() {
  $('#space').load('/public/html/appointment.html', function() {
    $(document).ready(function() {
      $('#day').change(function() {
        var changeday = $(this)
        if (changeday) {
          filtertime($('#day').val())
          $('#hourinit').removeAttr('disabled')
          $('#hourend').removeAttr('disabled')
        }
      })
    })
    bcreation()
  })
  return false
})

function filtertime(changeday) {
  // console.log(changeday)
  data = {
    day: changeday,
    doctorname: nameGet
  }
  $.ajax({
    type: 'POST',
    url: 'http://localhost:3000/valide',
    data: JSON.stringify(data),
    contentType: 'application/json',
    dataType: 'json',
    success: function(data) {
      var hourinit = []
      var hourend = []
      for (var i = 0; i < data.length; i++)      {
        hourinit[i] = data[i].hourinit
        hourend[i] = data[i].hourend
      }
      listHourInitAndEnd(hourinit, hourend, 9, 18, ['00', '20', '40'])
    },
    error: function(data) {
      if (data.status == 500) {
        alert('ERROR 500 ' + data.responseText)
      }
    }
  })
}

function listHourInitAndEnd(hourinit, hourend, init, end, delta) {
  var selectionInit = ''
  var selectionEnd = ''
  // init, end -->hour
  // delta -->min

  var listInitTemp = timelist(hourinit, init, end, delta, 'init')
  var listEndTemp = timelist(hourend, init, end, delta, 'end')

  listInit = listInitTemp.filter((number) => { return (listEndTemp.indexOf(number) - listInitTemp.indexOf(number) != 0) })
  listEnd = listEndTemp.filter((number) => { return (listEndTemp.indexOf(number) - listInitTemp.indexOf(number) != 0) })

  for (i = 0; i < listInit.length; i++) {
    selectionInit += "<option value='" + listInit[i] + "'>" + listInit[i] + '</option>'
    selectionEnd += "<option value='" + listEnd[i] + "'>" + listEnd[i] + '</option>'
  }

  $('#hourinit').html(selectionInit)
  $('#hourend').html(selectionEnd)
  function timelist(hourlist, init, end, delta, type)  {
    var list = []
    var width = delta.length
    var nlength = (end - init) + 1
    var k = 0

    for (var i = 0; i < nlength; i++) {
      for (var j = 0; j < width; j++) {
        list[k] = zeroFill(init + i, 2) + ':' + delta[j] + ':00'
        k = k + 1
      }
    }

    var listcopy = []
    if (type == 'init') {
      listcopy = list.slice(0, list.length - 3)
    }

    if (type == 'end') {
      listcopy = list.slice(1, list.length - 2)
    }

    return listcopy.filter((number) => { return hourlist.indexOf(number) == -1 })
  }

  function zeroFill(number, width)  {
    width -= number.toString().length
    if (width > 0)    {
      return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number
    }
    return number + '' // always return a string
  }
}

function bcreation() {
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

var brevised = $('#revised').click(function() {
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
  var rowTable = '<h1> TODAS LAS CITAS </h1> <table> <tr> \n  <th>Día</th> \n  <th>Inicio</th> \n  <th>Finalización</th> \n  <th>Ubicación</th> \n  <th>Asignada a</th>\n <th>CC del paciente</th></tr>'
  branch = {1:'Primaria', 2:'Secundaria', 3:'Terciaria'}
  for (i = 0; i < data.length; i++) {
    rowTable += '\n <tr> \n <td> ' + data[i].day + ' </td> \n <td> ' + data[i].hourinit + ' </td> \n <td> '
    + data[i].hourend + ' </td> \n <td> ' + branch[data[i].branch] + ' </td> \n <td> ' + data[i].assignedname + ' </td> \n <td> ' +
    data[i].assignedid + ' </td> </tr>'
  }
 rowTable=rowTable+"</table>"
  $('#space').html(rowTable)
}

var bclose = $('#close').click(function() {
  sessionStorage.clear()
  window.location.href = 'http://localhost:3000/'
  return false
})
