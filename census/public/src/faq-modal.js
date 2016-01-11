var hideFaqCard = function() {
  var curtain = $('#faq_curtain'),
      card_modal = $('#faq_modal');
      ;

  card_modal.fadeOut(180);
  curtain.fadeOut(200);
}
$(document).ready(function (){

    $('.faq_item').on('click',function(){
        var target = $(this);

        if (!target.hasClass('faq_item')) {
            target = $(target.parent());
        }

        // Recover the value of question, answer and dataviz;
        var qst = target.find('.qst').html(),
            asw = target.find('.asw').html(),
            dtvz = target.find('.dtvz').html();

        // Set the recovered values into the card
        $('#faq_title_bold').html(qst);
        $('#card_faq .asw').html(asw);
        $('#card_faq .dtvz').html(dtvz);

        // Show the card
        $('#faq_modal').fadeIn(200);
        $('#faq_curtain').fadeIn(180);

    });

    $('#faq_close_card').on('click', hideFaqCard);
});
