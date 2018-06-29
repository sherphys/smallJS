(function() {
    console.log('Ok!')
})()

'user strict'

var bnew = $('#new_app').click(function() {
    $('#new_appointment').load("/public/html/appointment.html")
    return false
})

var bcreation = $('#creation').click(function() {
    data = {
        type: $('#type').val(),
        day: $('#pass').val(),
        : $('#ccid').val()
      }
    return false
})