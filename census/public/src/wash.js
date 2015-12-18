window.lastPlaceId = undefined;

var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

var loadPlaceWashData = function(placeId) {

    var populateCard = function(data) {
        //First check if there is any data for the city
        if (data) {
            //If there is data, show the card with it
            $(".placeName").html(data.place.replace("City of",""));
            $("#SAM .value").html(data.SAM);
            $("#GAN .value").html(data.GAM);
            $("#ADD .value").html(data.ADD);
            $("#HWAT .value").html(data.HWAT);
            $("#HWAW .value").html(data.HWAW);
            $("#WSC .value").html(data.WSC);
            $("#EXND .value").html(data.EXND);
            $("#last_update_user .name").html(data.name);
            $("#last_update_user .role").html(data.role);
            $("#last_update_user .org").html(data.organization);
            var createdAt = new Date(data.createdAt);
            createdAt = monthNames[createdAt.getMonth()] +
                        "/" +
                        createdAt.getFullYear();
            $("#last_update .date").html(createdAt);

            // Updating hash on the URL
            window.location.hash = data.place.replace(/ /g,"_");

            // Updating social media share on the card
            $("#card_share a.tw").attr('href',
                        "http://twitter.com/share?url=" + encodeURIComponent(window.location.href) + "&text=");
            $("#card_share a.fb").attr('href',
                        "http://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(window.location.href));
            $("#card_share a.gp").attr('href',
                        "https://plus.google.com/share?url=" + encodeURIComponent(window.location.href));

            $('#modal').fadeIn(200);
            $('#curtain').fadeIn(180);
            window.lastPlaceId = placeId;
        } else {
            //If there is no data, show a message about it
            //TODO: Replace the card content with "there is no data for this city, contribute!"
        }

    } //populateCard

    // Check if the current place is the same as last,
    // so we don't need to download the data again.
    if (window.lastPlaceId && window.lastPlaceId==placeId){
        $('#modal').fadeIn(200);
        $('#curtain').fadeIn(180);
    } else {
      // Loading data from API
        $.getJSON("/api/wash/" + placeId + ".json")
            .done(function(data){
                populateCard(data.results[0]);
            });
    }
} //loadPlaceWashData


$(document).ready(function(){

    //if ($(body).hasClass('wash-submit')) {

        $("input.decimal").keydown(function(event) {

            if (event.shiftKey == true)
                event.preventDefault();

            if ((event.keyCode >= 48 && event.keyCode <= 57) ||
                (event.keyCode >= 96 && event.keyCode <= 105) ||
                event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 37 ||
                event.keyCode == 39 || event.keyCode == 46 || event.keyCode == 190) {

            } else {
                event.preventDefault();
            }

            if($(this).val().indexOf('.') !== -1 && event.keyCode == 190)
                event.preventDefault();

            //if a decimal has been added, disable the "."-button
        });

    //}

  // Adds the click listener to the search_bt
  $("#search_bt").on('click', function() {
    currentPlace = $("#place-select").val();
    loadPlaceWashData(placesId[currentPlace]);
  });

  //Load the card based on the url hash (#)
  if (window.location.hash) {
     var hashPlace = window.location.hash.substring(1).replace(/_/g," ");
     loadPlaceWashData(placesId[hashPlace]);
  }

});

