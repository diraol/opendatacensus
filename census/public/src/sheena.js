window.onload = function (){

  function $_GET() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
      vars[key] = value;
    });
    return vars;

  }

  var location = window.location.href.split("?")[0];
  var dbody = document.body;

  var i;
  var a;
  var b;
  var c;
  var mobile;

  var curtain = document.getElementById('curtain');
  var card_modal = document.getElementById('card_modal');

  var card_visible = false;

  window.onclick = function(){
    // if(card_visible) {
    //   card_visible = false;
    //   curtain.style.display = "none";
    //   card_modal.style.display = "none";
    // }else{
    //   card_visible = true;
    //   curtain.style.display = "block";
    //   card_modal.style.display = "block";
    // }
  }

  //////////////////////////////// MOBILE ////////////////////////////////

  var isMobile = {
    Android: function() {
      return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
      return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
      return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
      return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
      return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
      return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
  };

  if( isMobile.any() ){
    mobile = true;
    dbody.className = 'mobile';
  }else{
      mobile = false;
  }

  console.log( "MOBILE: " + mobile );


} // window.onload

$(document).ready(function(){
  $('#place-select').autocomplete({
    source: places,
    appendTo: "#place-select-group"
  });
})
