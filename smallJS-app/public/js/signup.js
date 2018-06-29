(function() {
    console.log('Ok!')
})()

'user strict'
function nextStep(user){
  let nextstep
  switch (user.type) {
    case 'admin': nextstep='/public/html/indexadmin.html'; break
    case 'doctor': nextstep='/public/html/indexdoctor.html'; break
    case 'customer': nextstep='/public/html/indexcustomer.html'; break
  }
  window.localStorage.setItem('name', user.name);
  window.localStorage.setItem('ccid', user.ccid);
  window.location.href = nextstep
}
var bnew = $('#new').click(function() {
    data = {
        type: $('#type').val(),
        password: $('#password').val(),
        ccid: $('#ccid').val(),
        name: $('#name').val(),
        username:  $('#username').val()
      }
      conditionRequired = data.type && data.password && data.ccid && data.username && data.name
      if (conditionRequired) {
        $.ajax({
          type: 'POST',
          url: 'http://localhost:3000/register',
          data: JSON.stringify(data),
          contentType: 'application/json',
          dataType:'json',
          success: function(data) {
            nextStep(data)
          },
          error: function(data) {
            if (data.status==400){
              alert("ERROR 400 "+data.responseText)
              window.location.href = "http://localhost:3000"
            }
            if (data.status==500){
              alert('ERROR 500 '+data.responseText)
            }
          }
        })
      }  else alert('Datos mal ingresados')
      return false

    return false
})
