window.lastPlaceId = undefined;

var indicators = {
    'SAM': {
        'name': 'Malnutrition Rate (Stunting)',
        'POOR': { 'min_value': 15, 'max_value': 100, 'score': 1 },
        'AVERAGE': { 'min_value': 5, 'max_value': 15, 'score': 2 },
        'GOOD': { 'min_value': 0, 'max_value': 5, 'score': 3 }
    },
    'GAN': {
        'name': 'Malnutrition Rate (Underweight)',
        'POOR': { 'min_value': 15, 'max_value': 100, 'score': 1 },
        'AVERAGE': { 'min_value': 5, 'max_value': 15, 'score': 2 },
        'GOOD': { 'min_value': 0, 'max_value': 5, 'score': 3 }
    },
    'ADD': {
        'name': 'Acute Diarrhoeal Disease (Prevalence)',
        'POOR': { 'min_value': 15, 'max_value': 100, 'score': 1 },
        'AVERAGE': { 'min_value': 5, 'max_value': 15, 'score': 2 },
        'GOOD': { 'min_value': 0, 'max_value': 5, 'score': 3 }
    },
    'HWAT': {
        'name': 'Households without access to toilet',
        'POOR': { 'min_value': 50, 'max_value': 100000000, 'score': 1 },
        'AVERAGE': { 'min_value': 20, 'max_value': 50, 'score': 2 },
        'GOOD': { 'min_value': 0, 'max_value': 20, 'score': 3 }
    },
    'HWAW': {
        'name': 'Households without access to water',
        'POOR': { 'min_value': 50, 'max_value': 100000000, 'score': 1 },
        'AVERAGE': { 'min_value': 20, 'max_value': 50, 'score': 2 },
        'GOOD': { 'min_value': 0, 'max_value': 20, 'score': 3 }
    },
    'WSC': {
        'name': '% of water sources positive with e.coli and other contaminants',
        'POOR': { 'min_value': 15, 'max_value': 100, 'score': 1 },
        'AVERAGE': { 'min_value': 5, 'max_value': 15, 'score': 2 },
        'GOOD': { 'min_value': 0, 'max_value': 5, 'score': 3 }
    },
    'EXND': {
        'name': 'Exposure to natural disasters (number of incidents reported)',
        'POOR': { 'min_value': 15, 'max_value': 100, 'score': 1 },
        'AVERAGE': { 'min_value': 5, 'max_value': 15, 'score': 2 },
        'GOOD': { 'min_value': 0, 'max_value': 5, 'score': 3 }
        //'HIGH': { 'lablel': 'POOR', 'score': 1 },
        //'MODERATE': { 'label': 'AVERAGE', 'score': 2 },
        //'LOW': { 'label': 'GOOD', 'score': 3 }
    }
}

var _get_number_score = function(indicator, value) {
    var output = {}
    if (value > indicators[indicator]['POOR'].min_value) {
        output = {'score': 1, 'label': 'POOR'};
    } else if (value > indicators[indicator]['AVERAGE'].min_value) {
        output = {'score': 2, 'label': 'AVERAGE'};
    } else {
        output = {'score': 3, 'label': 'GOOD'};
    }
    return output
}

var _get_label_score = function(indicator, value) {
    return indicators[indicator][value];
}

var indicator_score = function(indicator, value) {
    //if (indicator == "EXND") {
        //return _get_label_score('EXND', value);
    //} else {
        return _get_number_score(indicator, value);
    //}
}

var preparedness = function(data) {
    var index_sum = 0;
    for (indicator in indicators) {
        index_sum = index_sum + indicator_score(indicator, data[indicator]).score;
    }
    //index_sum = index_sum + _get_score('SAM', data.SAM).score;
    //index_sum = index_sum + _get_score('GAN', data.SAM).score;
    //index_sum = index_sum + _get_score('ADD', data.SAM).score;
    //index_sum = index_sum + _get_score('HWAT', data.SAM).score;
    //index_sum = index_sum + _get_score('HWAW', data.SAM).score;
    //index_sum = index_sum + _get_score('WSC', data.SAM).score;
    //index_sum = index_sum + _get_label_score('EXND', data.EXND).score;

    if (index_sum <= 14) {
        return { 'value': index_sum, 'label': 'Poorly resiliente' };
    } else if (index_sum <= 17) {
        return { 'value': index_sum, 'label': 'Moderately resilient' };
    } else {
        return { 'value': index_sum, 'label': 'Highly resilient' }
    }
}

var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

var loadPlaceWashData = function(placeId) {
    var warningMessage = function(message){

        var card_msg = $('<div/>', {
            class: 'card_msg'
        }).appendTo('#relationship_messages');

        // card_msg_title
        $('<div/>', {
            class: 'card_msg_title',
            text: 'Warning'
        }).appendTo(card_msg);

        $('<div/>', {
            class: 'card_msg_tx',
            html: message
        }).appendTo(card_msg);

    }

    var buildWarnMessages = function(data){
        poors = checkPoorIndicators(data);

        // Relationship (3)
        if (poors['GAN'] &&
            poors['ADD'] &&
            poors['HWAT'] &&
            poors['HWAW'] &&
            poors['WSC']) {
                warningMessage('Households with malnourished children and have low levels of water and sanitation access and contaminated water sources are at a high health-related risks.');
        }

        // Relationship (4)
        if (poors['ADD'] &&
            poors['HWAT'] &&
            poors['WSC'] &&
            poors['EXND']) {
                warningMessage('If households have poor water and sanitation services, and are highly exposed to natural disasters, then they are at a high risk during emergencies.');
        }

        // Relationship (1)
        if (poors['HWAW']) {
            warningMessage('If households have low access to water, then they will most likely have low access to sanitary toilets.');
        }

        // Relationship (2)
        if (poors['HWAT']) {
            warningMessage('If households have low access to toilets, then they are at a high risk to have acute diarrheal disease.');
        }

        // Relationship (5)
        if (poors['SAM'] &&
            poors['GAN'] &&
            poors['ADD']) {
                warningMessage('If households have high cases of SAM and GAM, and have had cases of diarrhea, then they are a high risk area during emergencies for WASH-related outbreaks.');
        }

        // Relationship (6)
        if (poors['ADD']) {
            warningMessage('If households have high cases of diarrhea, it is likely that their water sources are contaminated.');
        }

    };

    var checkPoorIndicators = function(data){
        var poors = {'SAM': false, 'GAN': false, 'ADD': false,
                    'HWAT': false, 'HWAW': false, 'WSC': false,
                    'EXND': false};

        for (indicator in indicators)
            if (indicator_score(indicator, data[indicator]).label == "POOR")
                poors[indicator] = true;

        return poors;
    }

    var buildChart = function(data){
        var graphDataPercentage = [],
            graphCatPercentage = [],
            graphDataHWA = [],
            graphCatHWA = [];
        for (indicator in indicators) {
            if (indicator != 'HWAW' && indicator != 'HWAT') {
                graphDataPercentage.push({
                    name: indicator, //indicators[indicator].name,
                    data: [data[indicator]]
                });
                graphCatPercentage.push(indicator);
            } else {
                graphDataHWA.push({
                    name: indicator, //indicators[indicator].name,
                    data: [data[indicator]]
                });
                graphCatHWA = [];
            }
        }

        $('#chart1').highcharts({
            chart: {
                type: 'column',
                spacingBottom: 5,
                spacingTop: 5,
                spacingLeft: 5,
                spacingRight: 5,
                width: '593'
                //position: 'absolute'
            },
            title: {
                text: 'See your performance on relative indicators'
            },
            xAxis: {
                categories: graphCatPercentage
            },
            credits: {
                enabled: false
            },
            series: graphDataPercentage
        });

        $('#chart2').highcharts({
            chart: {
                type: 'column',
                spacingBottom: 5,
                spacingTop: 5,
                spacingLeft: 5,
                spacingRight: 5,
                width: '593'
                //position: 'absolute'
            },
            title: {
                text: 'See your performance on absolute indicators'
            },
            xAxis: {
                categories: graphCatHWA
            },
            credits: {
                enabled: false
            },
            series: graphDataHWA
        });
    }

    var populateCard = function(data) {
        //First check if there is any data for the city
        if (data) {
            //If there is data, show the card with it
            $(".placeName").html(data.place.replace("City of",""));

            //TODO: Change the 'Congratulations message'
            //$("#card_msg1_title").html();

            // Calculates and fill the field of resilience index
            $("#wash_score").html(preparedness(data).value);
            $("#wash_result").html(preparedness(data).label);

            // Fill in the basic data (scores and labels)
            $("#SAM .value").html(data.SAM);
            $("#SAM .label").text(indicator_score('SAM',data.SAM).label);
            $("#GAN .value").html(data.GAN);
            $("#GAN .label").html(indicator_score('GAN', data.GAM).label);
            $("#ADD .value").html(data.ADD);
            $("#ADD .label").html(indicator_score('ADD', data.ADD).label);
            $("#HWAT .value").html(data.HWAT);
            $("#HWAT .label").html(indicator_score('HWAT', data.HWAT).label);
            $("#HWAW .value").html(data.HWAW);
            $("#HWAW .label").html(indicator_score('HWAW', data.HWAW).label);
            $("#WSC .value").html(data.WSC);
            $("#WSC .label").html(indicator_score('WSC', data.WSC).label);
            $("#EXND .value").html(data.EXND);
            $("#EXND .label").html(indicator_score('EXND', data.EXND).label);

            // Fill the warning messages
              // First clear the relationship_messages div
              $("#relationship_messages").empty();
              buildWarnMessages(data);


            // Build  the chart...
            buildChart(data);

            // Person who updated the data
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
        window.location.hash = data.place.replace(/ /g,"_");
    } else {
      // Loading data from API
        $.getJSON("/api/wash/" + placeId + ".json")
            .done(function(data){
                populateCard(data.results[0]);
            });
    }
} //loadPlaceWashData

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
    loadPlaceWashData(placesId[currentPlace]);
  });

  //Load the card based on the url hash (#)
  if (window.location.hash) {
     var hashPlace = window.location.hash.substring(1).replace(/_/g," ");
     loadPlaceWashData(placesId[hashPlace]);
  }

});

