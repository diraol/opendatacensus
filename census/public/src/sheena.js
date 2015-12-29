window.onload = function (){
  //////////////////////////////// MOBILE ////////////////////////////////
  var dbody = document.body;
  var mobile;

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

  // HEADER PLACE SEARCH AUTOCOMPLETE
    $('#place-select').autocomplete({
      source: places,
      appendTo: "#place-select-group"
    });

  // Control of modal/curtain hide
    var curtain = $('#curtain'),
      card_modal = $('#modal'),
      close_card = $('#close_card');

    var hideCard = function() {
      card_modal.fadeOut(180);
      curtain.fadeOut(200);
      window.location.hash = '';
    }

    curtain.on('click', hideCard);
    close_card.on('click', hideCard);

});
