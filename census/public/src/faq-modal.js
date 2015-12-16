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
        $('#title_bold').html(qst);
        $('#card_faq .asw').html(asw);
        $('#card_faq .dtvz').html(dtvz);

        // Show the card
        $('#modal').fadeIn(200);
        $('#curtain').fadeIn(180);

    });

    $('#curtain').on('click', function() {
        $('#modal').fadeOut(180);
        $('#curtain').fadeOut(200);
    });

    $('#close_card').on('click', function() {
        $('#modal').fadeOut(180);
        $('#curtain').fadeOut(200);
    });
});
