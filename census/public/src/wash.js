window.lastPlaceId = undefined;

var loadPlaceWashData = function(placeId) {
    var writeWarningMessage = function(message){
        $('<div/>', {
            class: 'card_msg_tx',
            html: message
        }).appendTo('#warn_messages');
    }

    var writePositiveMessage = function(message){
        $('<div/>', {
            class: 'card_msg_tx',
            html: message
        }).appendTo('#positive_messages');
    }

    var buildBarChart = function(chartData){

        $('#chart1').highcharts({
            chart: {
                type: 'column',
                spacingBottom: 5,
                spacingTop: 5,
                spacingLeft: 5,
                spacingRight: 5,
                width: '593'
            },
            title: {
                text: 'See your performance on relative indicators'
            },
            xAxis: {
                categories: chartData.categories
            },
            credits: {
                enabled: false
            },
            series: chartData.series
        });

    }

    var buildSeriesChart = function(chartData){

        $('#chart1').highcharts({
            chart: {
                type: 'spline',
                spacingBottom: 5,
                spacingTop: 5,
                spacingLeft: 5,
                spacingRight: 5,
                width: '593'
            },
            title: {
                text: 'See your performance on relative indicators'
            },
            xAxis: {
                categories: chartData.categories
            },
            plotOptions: {
                series: {
                    connectNulls: true
                }
            },
            credits: {
                enabled: false
            },
            series: chartData.series
        });

    }


    var populateCard = function(data) {
        //First check if there is any data for the city
        if (!$.isEmptyObject(data)) {
            //If there is data, show the card with it
            $(".placeName").html(data.placeType + " of " + data.placeName);

            // Change the 'Congratulations message'
            $("#card_msg1").html(data.preparedness.messages[0]);
            $("#card_msg2").html(data.preparedness.messages[1]);
            $("#card_msg3").html(data.preparedness.messages[2]);

            // Calculates and fill the field of resilience index
            $("#wash_score").html(parseFloat(data.preparedness.value).toFixed(2));
            $("#wash_result").html(data.preparedness.label);

            // Fill in the basic data (scores and labels)
            $("#SAM .value").html(data.indicators.SAM.current.value);
            $("#SAM .label").text(data.indicators.SAM.current.label);
            $("#GAN .value").html(data.indicators.GAN.current.value);
            $("#GAN .label").html(data.indicators.GAN.current.label);
            $("#ADD .value").html(data.indicators.ADD.current.value);
            $("#ADD .label").html(data.indicators.ADD.current.label);
            $("#HWAT .value").html(data.indicators.HWAT.current.value);
            $("#HWAT .label").html(data.indicators.HWAT.current.label);
            $("#HWAW .value").html(data.indicators.HWAW.current.value);
            $("#HWAW .label").html(data.indicators.HWAW.current.label);
            $("#WSC .value").html(data.indicators.WSC.current.value);
            $("#WSC .label").html(data.indicators.WSC.current.label);
            $("#EXND .value").html(data.indicators.EXND.current.value);
            $("#EXND .label").html(data.indicators.EXND.current.label);

            // Fill the warning messages
            // First clear the relationship_messages div
            $("#warn_messages").empty();
            if (!$.isEmptyObject(data.warningMessages)) {
                // card_msg_title
                $('<div/>', {
                    class: 'card_msg_title',
                    text: 'Warning'
                }).appendTo("#warn_messages");
                for (var message in data.warningMessages) {
                    writeWarningMessage(data.warningMessages[message]);
                }
            }
            // Fill the positive messages
            // First clear the relationship_messages div
            $("#positive_messages").empty();
            if (!$.isEmptyObject(data.positiveMessages)) {
                // card_msg_title
                $('<div/>', {
                    class: 'card_msg_title',
                    text: 'Positive Note'
                }).appendTo("#positive_messages");
                for (var message in data.positiveMessages) {
                    writePositiveMessage(data.positiveMessages[message]);
                }
            }

            // Build  the chart...
            if (data.seriesChart) {
                buildSeriesChart(data.seriesChart)
            } else {
                buildBarChart(data.barChart);
            }

            // Person who updated the data
            $("#last_update_user .name").html(data.lastUpdate.name);
            $("#last_update_user .role").html(data.lastUpdate.role);
            $("#last_update_user .org").html(data.lastUpdate.org);
            $("#last_update .date").html(data.lastUpdate.date);

            // Updating hash on the URL
            var hash = ( data.placeType + " of " + data.placeName ).replace(/ /g,"_")
            window.location.hash = hash;

            // Updating social media share on the card
            $("#card_share a.tw").attr('href',
                        "http://twitter.com/share?url=" + encodeURI(window.location.host + "/#"  + hash) + "&text=");
            $("#card_share a.fb").attr('href',
                        "http://www.facebook.com/sharer/sharer.php?u=" + encodeURI(window.location.host + "/#" + hash ));
            $("#card_share a.gp").attr('href',
                        "https://plus.google.com/share?url=" + encodeURI(window.location.host + "/#"  + hash));

            // Setting placeId on the update form
            $("#updateData [name='place']").val(placeId);

            // Updating the print CARD url
            $("#print_card").off('click');
            $("#print_card").on('click', function(){
                printPop(placeId);
            });

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
        var hash = $('.placeName').text().trim();
        window.location.hash = hash.replace(/ /g,"_");
    } else {
      // Loading data from API
        $.getJSON("/api/wash/" + placeId + ".json")
            .done(function(data){
                populateCard(data.results);
            });
    }
} //loadPlaceWashData

var printPop = function(placeID) {
    var printWindow = null;
    var strWindowFeatures = "menubar=no,location=no,resizable=yes,scrollbars=yes,status=no,toolbar=no,personalbar=no";
    printWindow = window.open('/print/wash/' + placeID ,'',strWindowFeatures);
    printWindow.focus();
    printWindow.print();
}

$(document).ready(function(){

    if ($('body').hasClass('wash-submit')) {

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

    }

  // Adds the click listener to the search_bt
  $("#search_bt").on('click', function() {
    currentPlace = $("#place-select").val();
    //placesId is built on the header.html file by node
    loadPlaceWashData(placesId[currentPlace]);
  });

  //Load the card based on the url hash (#)
  if (window.location.hash) {
    var hashPlace = window.location.hash.substring(1).replace(/_/g," ");
    //placesId is built on the header.html file by node
    loadPlaceWashData(placesId[hashPlace]);
  }

});

