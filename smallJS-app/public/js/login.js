(function() {
    console.log('Ok!')
})()

'user strict'

function nextStep(user) {
  let nextstep
  switch (user.type) {
    case 'admin': nextstep = '/public/html/indexadmin.html'; break
    case 'doctor': nextstep = '/public/html/indexdoctor.html'; break
    case 'customer': nextstep = '/public/html/indexcustomer.html'; break
  }
  window.sessionStorage.setItem('name', user.name)
  window.sessionStorage.setItem('ccid', user.ccid)
  window.location.href = nextstep
}

var bnew = $('#new').click(function() {
    window.location.href = 'public/html/signup.html'
    return false
})

var blog = $('#login').click(function() {
  data = {
    type: $('#type').val(),
    password: $('#pass').val(),
    ccid: $('#ccid').val()
  }

  conditionRequired = data.type && data.password && data.ccid
  if (conditionRequired) {
    $.ajax({
      type: 'POST',
      url: 'http://localhost:3000/redir',
      data: JSON.stringify(data),
      contentType: 'application/json',
      dataType: 'json', // Otra forma importante ¡ESTUDIAR!
      success: function(data) {
        nextStep(data)
      },
      error: function(data) {
        alert('Usuario no encontrado. ERROR 500 ' + data.responseText)
      }
    })
  }  else alert('Datos mal ingresados')
  return false
})

