(function() {
    console.log('Ok!')
})()

'user strict'
function nextStep(user) {
  let nextstep={
    admin:'/public/html/indexadmin.html',
    doctor:'/public/html/indexdoctor.html',
    customer:'/public/html/indexcustomer.html',
    none:'public/html/signup.html'
  }

  switch (user.type) {
    case 'admin': nextstep = '/public/html/indexadmin.html'; break
    case 'doctor': nextstep = '/public/html/indexdoctor.html'; break
    case 'customer': nextstep = '/public/html/indexcustomer.html'; break
  }
  window.localStorage.setItem('name', user.name)
  window.localStorage.setItem('ccid', user.ccid)
  window.location.href = nextstep
}


function showalert(data){
  //En esta función podía hacer más cosas especificas 
  // tal que me mostrara los errores de una forma u otra. 
  //alert(data)
  swal({
    title:"Oops!",
    text: data,
    icon: "error",
    dangerMode: true
  })
}