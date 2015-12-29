'use strict';

var csv = require('csv');
var _ = require('lodash');
var moment = require('moment');
var utils = require('./utils');
var modelUtils = require('../models').utils;

var outputItemsAsJson = function(response, items, mapper) {
  if (_.isFunction(mapper)) {
    items = _.map(items, mapper);
  }
  response.json({count: items.length, results: items});
};

var outputItemsAsCsv = function(response, items, mapper, columns) {
  var options = {
    delimiter: ',',
    quote: '"',
    quoted: true,
    rowDelimiter: 'unix'
  };
  if (_.isArray(columns)) {
    options.header = true;
    options.columns = columns;
  }
  if (_.isFunction(mapper)) {
    items = _.map(items, mapper);
  }
  var stringify = csv.stringify(items, options);
  response.header('Content-Type', 'text/csv');
  stringify.pipe(response);
};

var questions = function(req, res) {

  // Get request params
  var format = req.params.format;

  // Initial data options
  var dataOptions = _.merge(
    modelUtils.getDataOptions(req),
    {
      cascade: false,
      with: {Place: false, Entry: false, Dataset: false}
    }
  );

  // Make request for data, return it
  modelUtils.getData(dataOptions).then(function(data) {

    var columns = [
      'id',
      'site',
      'question',
      'description',
      'type',
      'placeholder',
      'score',
      'order',
      'icon',
      'dependants',
    ];
    var results = data.questions;
    var mapper = function(item) {
      var result = {};
      _.each(columns, function(name) {
        result[name] = item[name];
      });
      return result;
    };

    switch (format) {
      case 'json': {
        outputItemsAsJson(res, results, mapper);
        break;
      }
      case 'csv': {
        outputItemsAsCsv(res, results, mapper, columns);
        break;
      }
      default: {
        res.send(404);
        break;
      }
    }

  }).catch(console.trace.bind(console));

};

var datasets = function(req, res, next) {

  // Get request params
  var report = req.params.report;
  var strategy = req.params.strategy;
  var format = req.params.format;

  // Report can be only `score`
  var isScore = false;
  if (report === 'score') {
    var isScore = true;
  } else if (report) {
    return res.sendStatus(404);
  }

  // Initial data options
  var dataOptions = _.merge(modelUtils.getDataOptions(req), {
      cascade: false,
      with: {Place: false, Entry: isScore, Question: isScore}
    }
  );

  // Strategy can be only `cascade`
  if (strategy === 'cascade') {
    dataOptions = _.merge(dataOptions, {cascade: true});
  } else if (strategy) {
    return res.sendStatus(404);
  }

  // Make request for data, return it
  modelUtils.getData(dataOptions).then(function(data) {

    var columns = [
      'id',
      'site',
      'name',
      'description',
      'category',
      'icon',
      'order',
    ];
    if (isScore) {
      columns = columns.concat([
        'rank',
        'score',
        'relativeScore',
      ]);
    }
    var results = data.datasets;
    var mapper = function(item) {
      var result = {};
      item.score = item.computedScore;
      item.relativeScore = item.computedRelativeScore;
      _.each(columns, function(name) {
        result[name] = item[name];
      });
      return result;
    };

    switch (format) {
      case 'json': {
        outputItemsAsJson(res, results, mapper);
        break;
      }
      case 'csv': {
        outputItemsAsCsv(res, results, mapper, columns);
        break;
      }
      default: {
        res.sendStatus(404);
        break;
      }
    }

  }).catch(console.trace.bind(console));

};

var washPlaceLast = function(req, res, next) {

  // Get request params
  var format = req.params.format;

  // Initial data options
  var dataOptions = _.merge(
    modelUtils.getDataOptions(req),
    {
      cascade: false,
      ynQuestions: false,
      with: {
          Entry: false,
          Dataset: false,
          Question: false,
          Faq: false,
          Wash: true
      }
    }
  );

  // Make request for data, return it
  modelUtils.getData(dataOptions).then(function(data) {

    // This is for CSV and 'default' output, not for json
    var results = [];

    var columns = [
      'site',
      'placeId',
      'placeName',
      'placeType',
      'region',
      'SAM',
      'lastUpdateSAM',
      'GAN',
      'lasUpdateGAN',
      'ADD',
      'lastUpdateADD',
      'HWAT',
      'lastUpdateHWAT',
      'HWAW',
      'lastUpdateHWAW',
      'WSC',
      'lastUpdateWSC',
      'EXND',
      'lastUpdateEXND',
      'name',
      'organization',
      'role',
      'email',
      'createdAt'
    ];

    if (data.wash) {
      results = [data.wash.dataValues];
      results[0]['placeId'] = results[0].place;
      results[0]['placeName'] = data.place.dataValues.name;
    } else if (!_.isEmpty( data.washs )) {
      _.forEach(data.washs, function(washData, washKey) {
        var insert = washData.dataValues;
        insert['placeId'] = insert.place;
        insert['placeName'] = data.place.dataValues.name;
        results.push(insert);
      });
    }

    var mapper = function(item) {
      var result = {};
      _.each(columns, function(name) {
        result[name] = item[name];
      });
      return result;
    };

    // Now we go for JSON output
    // TODO: Read this hardcoded data from spreadsheet
    var indicators_references = {
        SAM: {
            POOR: { min_value: 15, max_value: 100, score: 1 },
            AVERAGE: { min_value: 5, max_value: 15, score: 2 },
            GOOD: { min_value: 0, max_value: 5, score: 3 }
        },
        GAN: {
            POOR: { min_value: 15, max_value: 100, score: 1 },
            AVERAGE: { min_value: 5, max_value: 15, score: 2 },
            GOOD: { min_value: 0, max_value: 5, score: 3 }
        },
        ADD: {
            POOR: { min_value: 15, max_value: 100, score: 1 },
            AVERAGE: { min_value: 5, max_value: 15, score: 2 },
            GOOD: { min_value: 0, max_value: 5, score: 3 }
        },
        HWAT: {
            POOR: { min_value: 50, max_value: 100000000, score: 1 },
            AVERAGE: { min_value: 20, max_value: 50, score: 2 },
            GOOD: { min_value: 0, max_value: 20, score: 3 }
        },
        HWAW: {
            POOR: { min_value: 50, max_value: 100000000, score: 1 },
            AVERAGE: { min_value: 20, max_value: 50, score: 2 },
            GOOD: { min_value: 0, max_value: 20, score: 3 }
        },
        WSC: {
            POOR: { min_value: 15, max_value: 100, score: 1 },
            AVERAGE: { min_value: 5, max_value: 15, score: 2 },
            GOOD: { min_value: 0, max_value: 5, score: 3 }
        },
        EXND: {
            POOR: { min_value: 15, max_value: 100, score: 1 },
            AVERAGE: { min_value: 5, max_value: 15, score: 2 },
            GOOD: { min_value: 0, max_value: 5, score: 3 }
        }
    }

    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    /*
     * Evaluates each indicator based on the previous defined references
     * as input we have the indicator 'name' and it's value
     * as output we will have and object with a score and a label
     */
    var evaluate_indicator = function(indicator, value) {
        var output = {}
        if (value > indicators_references[indicator]['POOR'].min_value) {
            output = {'score': 1, 'label': 'POOR'};
        } else if (value > indicators_references[indicator]['AVERAGE'].min_value) {
            output = {'score': 2, 'label': 'AVERAGE'};
        } else {
            output = {'score': 3, 'label': 'GOOD'};
        }
        return output
    }

    /*
     * Evaluate all indicators
     * as input we have and indicators object, a list (washsData) with all washData objects,
     *          the currentData and previousData (first and second element from washsData).
     * as output we return and object (dict/array) with two items, the modified indicators
     * object and a list called allDates, with all dates (month/year) that has any data
     * from any of the indicators
     */
    var evaluate_indicators = function(indicators, washsData, currentData, previousData) {
        var allDates = [];
        var dateFields = ['lastUpdateSAM',
                          'lastUpdateGAN',
                          'lastUpdateADD',
                          'lastUpdateHWAT',
                          'lastUpdateHWAW',
                          'lastUpdateWSC',
                          'lastUpdateEXND'];
        // Collecting all possible dates
        _.forEach(washsData, function(wash){
            var data = wash.dataValues;
            for (var field in dateFields) {
                var date = dateToMonthYear(data[dateFields[field]], 'allDates');
                if (allDates.indexOf(date) == -1) allDates.push(date);
            }
        });

        allDates = allDates.sort();
        // Building a ref list to "allValues" to have all possible dates,
        // initializing it with the size of the allDates vector;
        var baseAllValues = new Array(allDates.length);
        baseAllValues.fill(null);

        indicators.SAM.name = 'Malnutrition Rate (Stunting)';
        indicators.SAM.current = _.assign({ value: currentData.SAM}, evaluate_indicator('SAM', currentData.SAM));
        indicators.SAM.previous = _.assign({ value: previousData.SAM}, evaluate_indicator('SAM', previousData.SAM));
        indicators.SAM.allValues = _.cloneDeep( baseAllValues );
        indicators.GAN.name = 'Malnutrition Rate (Underweight)';
        indicators.GAN.current = _.assign({ value: currentData.GAN}, evaluate_indicator('GAN', currentData.GAN));
        indicators.GAN.previous = _.assign({ value: previousData.GAN}, evaluate_indicator('GAN', previousData.GAN));
        indicators.GAN.allValues = _.cloneDeep( baseAllValues );
        indicators.ADD.name = 'Acute Diarrhoeal Disease (Prevalence)';
        indicators.ADD.current = _.assign({ value: currentData.ADD}, evaluate_indicator('ADD', currentData.ADD));
        indicators.ADD.previous = _.assign({ value: previousData.ADD}, evaluate_indicator('ADD', previousData.ADD));
        indicators.ADD.allValues = _.cloneDeep( baseAllValues );
        indicators.HWAT.name = 'Households without access to toilet';
        indicators.HWAT.current = _.assign({ value: currentData.HWAT}, evaluate_indicator('HWAT', currentData.HWAT));
        indicators.HWAT.previous = _.assign({ value: previousData.HWAT}, evaluate_indicator('HWAT', previousData.HWAT));
        indicators.HWAT.allValues = _.cloneDeep( baseAllValues );
        indicators.HWAW.name = 'Households without access to water';
        indicators.HWAW.current = _.assign({ value: currentData.HWAW}, evaluate_indicator('HWAW', currentData.HWAW));
        indicators.HWAW.previous = _.assign({ value: previousData.HWAW}, evaluate_indicator('HWAW', previousData.HWAW));
        indicators.HWAW.allValues = _.cloneDeep( baseAllValues );
        indicators.WSC.name = '% of water sources positive with e.coli and other contaminants';
        indicators.WSC.current = _.assign({ value: currentData.WSC}, evaluate_indicator('WSC', currentData.WSC));
        indicators.WSC.previous = _.assign({ value: previousData.WSC}, evaluate_indicator('WSC', previousData.WSC));
        indicators.WSC.allValues = _.cloneDeep( baseAllValues );
        indicators.EXND.name = 'Exposure to natural disasters (number of incidents reported)';
        indicators.EXND.current = _.assign({ value: currentData.EXND}, evaluate_indicator('EXND', currentData.EXND));
        indicators.EXND.previous = _.assign({ value: previousData.EXND}, evaluate_indicator('EXND', previousData.EXND));
        indicators.EXND.allValues = _.cloneDeep(baseAllValues);

        // New let's fill the arrays with it's values
        _.forEachRight(washsData, function(wash){
            var data = wash.dataValues;
            var date = data.lastUpdateSAM;
            var value = data.SAM ? data.SAM : undefined;
            if (date != undefined & value >= 0) indicators.SAM.allValues[allDates.indexOf(dateToMonthYear(date, 'allDates'))] = value;
            date = data.lastUpdateGAN;
            value = data.GAN ? data.GAN : undefined;
            if (date != undefined & value >= 0) indicators.GAN.allValues[allDates.indexOf(dateToMonthYear(date, 'allDates'))] = value;
            date = data.lastUpdateADD;
            value = data.ADD ? data.ADD : undefined;
            if (date != undefined & value >= 0) indicators.ADD.allValues[allDates.indexOf(dateToMonthYear(date, 'allDates'))] = value;
            date = data.lastUpdateHWAT;
            value = data.HWAT ? data.HWAT : undefined;
            if (date != undefined & value >= 0) indicators.HWAT.allValues[allDates.indexOf(dateToMonthYear(date, 'allDates'))] = value;
            date = data.lastUpdateHWAW;
            value = data.HWAW ? data.HWAW : undefined;
            if (date != undefined & value >= 0) indicators.HWAW.allValues[allDates.indexOf(dateToMonthYear(date, 'allDates'))] = value;
            date = data.lastUpdateWSC;
            value = data.WSC ? data.WSC : undefined;
            if (date != undefined & value >= 0) indicators.WSC.allValues[allDates.indexOf(dateToMonthYear(date, 'allDates'))] = value;
            date = data.lastUpdateEXND;
            value = data.EXND ? data.EXND : undefined;
            if (date != undefined & value >= 0) indicators.EXND.allValues[allDates.indexOf(dateToMonthYear(date, 'allDates'))] = value;
        });

        return {indicators:indicators, allDates:allDates};
    }

    /*
     * This functions calculate the preparedness of the place based on the indicators
     * as input we have the indicators
     * and as output we have and object with the preparedness score (percentage)
     * and also a label and a list with three messages to be inserted on the card.
     */
    // TODO: Read the reference values from the config spreadsheet
    var calculate_preparedness = function(indicators) {
        var index_sum = 0;
        var output = {value: undefined, label: undefined, messages: []};
        _.forEach(indicators, function(indicatorData, indicatorKey){
            index_sum = index_sum + indicatorData.current.score;
        });
        output.value = 50 * (index_sum -7)/7;
        if (index_sum < 14) {
            output.label = 'Poorly resiliente';
            output.messages = ['Ouch!', 'have a lot of work to do', 'could improve so much more'];
        } else if (index_sum <= 17) {
            output.label = 'Moderately resilient';
            output.messages = ['Not Bad!', 'are not completely unprepared', 'could improve so much more'];
        } else {
            output.label = 'Highly resilient'
            output.messages = ['Congratulations!', 'are well prepared', 'can still improve your score'];
        }
        return output;
    }

    /*
     * Function to create a bool indicating the existance of at least one
     * indicator that is Good
     */
    var washCheckNoneGood = function(indicators) {
        var noneGood = true;
        _.forEach(indicators, function(indicator, key){
            if (indicator.current.score == 3) {
                noneGood = false;
            }
        })
        return noneGood;
    }

    /*
     * function to generate a general ImproveMessage
     */
    var washImproveMessage = function(allGood, noneGood, indicators) {
        var message = "";
        if (allGood) {
            message = "Try to improve your indicators year after year and make sure that none of  them start to fall off.";
        } else if (noneGood) {
            message = "All your indicators.";
        } else {
            message = "List of Poor/Average indicators: ";
            for (var indicator in indicators) {
                if (indicators[indicator].current.score != 3) {
                    message = message + indicators[indicator].current.name + ", ";
                }
            }
            message = _.trimRight(message, ",") + ".";
        }
        return message;
    }

    /*
     * Function that generates the "goodToKnow" section messages,
     * checking the interaction between indicators
     */
    var washGoodToKnow = function(indicators) {
        var messages = [];

        // Check 3 and 4
        if (indicators.ADD.current.score == 1 &&
            indicators.HWAT.current.score == 1) {
                messages.push("The high prevalence of acute diahorreal disease is probably due to the high number of households without access to toilets.");
        }
        // Check 4 and 5
        if (indicators.HWAT.current.score == 1 &&
            indicators.HWAW.current.score == 1) {
                 messages.push("The high number of households without access to toilets is probably due to the high number of households without access to water.");
        }
        // Check 1, 2 and 3
        if (indicators.SAM.current.score == 1 &&
            indicators.GAN.current.score == 1 &&
            indicators.ADD.current.score == 1 ) {
                messages.push("The combination of a high level of Severe Acute Malnutrition with a high level of Global Acute Malnutrition and a high prevalence of Acute Diarrhoeal Disease will put your city/province at risk of WASH-related outbreaks during future emergencies.");
        }
        // Check 3, 4, 6 and 7
        if (indicators.ADD.current.score == 1 &&
            indicators.HWAT.current.score == 1 &&
            indicators.WSC.current.score == 1 &&
            indicators.WXND.current.score == 1 ) {
                messages.push("The combination of a high prevalence of Acute Diarrhoeal Disease with a high number of households without access to toilets, and a high percentage of water sources positive with e.coli and other contaminants and and a high exposure to natural disasters will put your city/province at high risk during future emergencies.");
        }
        // Check 2, 3, 4, 5 and 6
        if (indicators.GAN.current.score == 1 &&
            indicators.ADD.current.score == 1 &&
            indicators.HWAT.current.score == 1 &&
            indicators.HWAW.current.score == 1 &&
            indicators.WSC.current.score == 1 ) {
                messages.push("The combination of high Global Acute Malnutrition with a high prevalence of Acute Diarrhoeal Disease, a high number of households without access to toilets, and a high percentage of water sources positive with e.coli and other contaminants will put your city/province at high health risk during future emergencies.");
        }
        return messages;
    }

    /*
     * Generate warning Messages, if any is needed
     */
    var washGetWarnings = function(indicators) {
        var messages = [];
        for (var indicator in indicators) {
            var current = indicators[indicator].current,
                previous = indicators[indicator].previous;
            if (current.value > previous.value) {
                var message = "The <span class='contrast' id='wash_score'>" + indicators[indicator].name +
                              "</span> has increased since the last update.";
                messages.push(message);
            }
        }
        // Check if all indicators are worse than before
        if (_.size(messages) == _.size(indicators)) {
            messages = ["All your indicators are worse than the previous update!"];
        }
        return messages;
    }

    /*
     * Generate positive messages, if there is any
     */
    var washGetPositives = function(indicators) {
        var messages = [];
        for (var indicator in indicators) {
            var current = indicators[indicator].current,
                previous = indicators[indicator].previous;
            if (current.value < previous.value) {
                var message = "The <span class='contrast' id='wash_score'>" + indicators[indicator].name +
                              "</span> has decreased since the last update.";
                messages.push(message);
            }
        }
        // Check if all indicators are worse than before
        if (_.size(messages) == _.size(indicators)) {
            messages = ["All your indicators have improved! Keep up the good work!"];
        }
        return messages;
    }

    /*
     * Generates the data for the bar chart, that is shown when
     * we have just one value per indicator
     */
    var washBarChartData = function(indicators) {
        var data = {
            categories: [],
            series: []
        }
        _.forEach(indicators, function(indicatorData, indicatorKey){
            data.categories.push(indicatorKey);
            data.series.push({
                name: indicatorKey,
                data: [indicatorData.current.value]
            });
        });
        return data;
    }

    /*
     * Generates the data for the Series Chart, when we have more
     * than one data per indicator.
     */
    var washSeriesChartData = function(indicators, allDates) {
        var data = {
            categories: [],
            series: []
        }
        data.categories = allDates;
        _.forEach(indicators, function(indicatorData, indicatorKey){
            data.series.push({
                name: indicatorKey,
                data: indicatorData.allValues
            })
        });
        return data;
    }

    var dateToMonthYear = function(date, format){
        // Receives a date, as string, in the format;
        // Wed Jul 01 2015 00:00:00 GMT-0400 (EDT)
        // and returns it in 'month/Year', month a one or
        // two digits number and year a 4 digits number.
        var monthYear = new Date(date),
            month = monthYear.getMonth() + 1,
            year = monthYear.getFullYear();
            month = month < 10 ? "0" + month.toString() : month.toString();
            year = year.toString();

        if (format == "str"){
            monthYear = month + "/" + year;
        } else if (format == 'allDates'){
            monthYear = year + "-" + month;
        } else {
            monthYear = {year: year, month: month};
        }
        return monthYear;
    }

    // Creating the output variable, mainly to define its format.
    var washOutput = {
        placeID: undefined,
        placeName: undefined,
        placeType: undefined,
        region: undefined,
        indicators: {
            SAM:  { name: undefined,
                    current: { value: undefined, score: undefined, label: undefined },
                    previous: { value: undefined, score: undefined, label: undefined },
                    allValues: [] // ordered list with n items, n equals the max number of dates for all indicators
            },
            GAN:  { name: undefined,
                    current: { value: undefined, score: undefined, label: undefined },
                    previous: { value: undefined, score: undefined, label: undefined },
                    allValues: []
            },
            ADD:  { name: undefined,
                    current: { value: undefined, score: undefined, label: undefined },
                    previous: { value: undefined, score: undefined, label: undefined },
                    allValues: []
            },
            HWAT: { name: undefined,
                    current: { value: undefined, score: undefined, label: undefined },
                    previous: { value: undefined, score: undefined, label: undefined },
                    allValues: []
            },
            HWAW: { name: undefined,
                    current: { value: undefined, score: undefined, label: undefined },
                    previous: { value: undefined, score: undefined, label: undefined },
                    allValues: []
            },
            WSC:  { name: undefined,
                    current: { value: undefined, score: undefined, label: undefined },
                    previous: { value: undefined, score: undefined, label: undefined },
                    allValues: []
            },
            EXND: { name: undefined,
                    current: { value: undefined, score: undefined, label: undefined },
                    previous: { value: undefined, score: undefined, label: undefined },
                    allValues: []
            }
        },
        preparedness: { value: undefined, label: undefined, messages: [] },
        lastUpdate: { name: undefined, role: undefined, org: undefined, date: undefined },
        allGood: false,
        noneGood: true,
        improveScoreMessage: undefined,
        goodToKnowMessages: [],
        warningMessages: [],
        positiveMessages: [],
        barChart: {
            categories: undefined,
            series: undefined
        },
        seriesChart: {
            categories: undefined,
            series: undefined
        }
    }

    if (!_.isEmpty( data.washs )){

        var place = data.place.dataValues,
            currentData = data.washs[0].dataValues,
            previousData = data.washs[1].dataValues;

        washOutput.placeID = place.id;
        washOutput.placeName = place.name;
        washOutput.placeType = place.type;
        washOutput.region = place.region;
        var processIndicators = evaluate_indicators(washOutput.indicators, data.washs, currentData, previousData);
        washOutput.indicators = processIndicators.indicators;
        washOutput.allDates = processIndicators.allDates;
        washOutput.preparedness = calculate_preparedness(washOutput.indicators);
        washOutput.lastUpdate.name = currentData.name;
        washOutput.lastUpdate.role = currentData.role;
        washOutput.lastUpdate.org = currentData.organization;
        washOutput.lastUpdate.email = currentData.email[0];
        washOutput.lastUpdate.date = dateToMonthYear(data.createdAt, "str");
        washOutput.allGood = washOutput.preparedness.value == 21 ? true : false;
        washOutput.noneGood = washCheckNoneGood(washOutput.indicators);
        washOutput.improveScoreMessage = washImproveMessage(washOutput.allGood, washOutput.noneGood, washOutput.indicators);
        washOutput.goodToKnowMessages = washGoodToKnow(washOutput.indicators);
        washOutput.warningMessages = washGetWarnings(washOutput.indicators);
        washOutput.positiveMessages = washGetPositives(washOutput.indicators);

        if(data.washs.length > 1) {
            washOutput.seriesChart = washSeriesChartData(washOutput.indicators, washOutput.allDates);
            washOutput.barChart = false;
        } else {
            washOutput.barChart = washBarChartData(washOutput.indicators);
            washOutput.seriesChart = false;
        }

    }

    switch (format) {
      case 'json': {
        outputItemsAsJson(res, washOutput, undefined);
        break;
      }
      case 'csv': {
        outputItemsAsCsv(res, results, mapper, columns);
        break;
      }
      default: {
        res.send(404);
        break;
      }
    }

  }).catch(console.trace.bind(console));

}

var places = function(req, res, next) {

  // Get request params
  var report = req.params.report;
  var strategy = req.params.strategy;
  var format = req.params.format;

  // Report can be only `score`
  var isScore = false;
  if (report === 'score') {
    var isScore = true;
  } else if (report) {
    return res.sendStatus(404);
  }

  // Initial data options
  var dataOptions = _.merge(modelUtils.getDataOptions(req), {
      cascade: false,
      with: {Dataset: false, Entry: isScore, Question: isScore}
    }
  );

  // Strategy can be only `cascade`
  if (strategy === 'cascade') {
    dataOptions = _.merge(dataOptions, {cascade: true});
  } else if (strategy) {
    return res.sendStatus(404);
  }

  // Make request for data, return it
  modelUtils.getData(dataOptions).then(function(data) {

    var columns = [
      'id',
      'site',
      'name',
      'type',
      'slug',
      'region',
      'continent',
    ];
    if (isScore) {
      columns = columns.concat([
        'rank',
        'score',
        'relativeScore',
      ]);
    }
    var results = data.places;
    var mapper = function(item) {
       var result = {};
       item.score = item.computedScore;
       item.relativeScore = item.computedRelativeScore;
       _.each(columns, function(name) {
         result[name] = item[name];
       });
       return result;
    };

    switch (format) {
      case 'json': {
        outputItemsAsJson(res, results, mapper);
        break;
      }
      case 'csv': {
        outputItemsAsCsv(res, results, mapper, columns);
        break;
      }
      default: {
        res.sendStatus(404);
        break;
      }
    }

  }).catch(console.trace.bind(console));

};

var faqs = function(req, res, next) {

  // Get request params
  var format = req.params.format;

  // Initial data options
  var dataOptions = _.merge(
    modelUtils.getDataOptions(req),
    {
      cascade: false,
      with: {Place: false, Entry: false, Dataset: false, Question: false}
    }
  );

  // Make request for data, return it
  modelUtils.getData(dataOptions).then(function(data) {

    var columns = [
      'priority',
      'site',
      'question',
      'answer',
      'dataviz'
    ];
    var results = data.faqs;
    var mapper = function(item) {
      var result = {};
      _.each(columns, function(name) {
        result[name] = item[name];
      });
      return result;
    };

    switch (format) {
      case 'json': {
        outputItemsAsJson(res, results, mapper);
        break;
      }
      case 'csv': {
        outputItemsAsCsv(res, results, mapper, columns);
        break;
      }
      default: {
        res.send(404);
        break;
      }
    }

  }).catch(console.trace.bind(console));

}

var entries = function(req, res, next) {

  // Get request params
  var format = req.params.format;
  var strategy = req.params.strategy;

  // Initial data options
  var dataOptions = _.merge(modelUtils.getDataOptions(req), {
      cascade: false,
      ynQuestions: false,
      with: {Dataset: false, Place: false, Question: true}
    }
  );

  // If year is implicitly set
  if (!!req.params.isYearImplicitlySet) {
    dataOptions = _.merge(dataOptions, {year: false});
  }

  // Strategy can be only `cascade` or `all`
  if (strategy === 'cascade') {
    dataOptions = _.merge(dataOptions, {cascade: true});
  } else if (strategy === 'all') {
    dataOptions = _.merge(dataOptions, {keepAll: true});
  } else if (strategy) {
    return res.sendStatus(404);
  }

  // Make request for data, return it
  modelUtils.getData(dataOptions).then(function(data) {

      var results = data.entries;
      var mapper = function(item) {
        var answers = utils.ynuAnswers(item.answers || {});
        return {
          id: item.id,
          site: item.site,
          timestamp: moment(item.createdAt).format('YYYY-MM-DDTHH:mm:ss'),
          year: item.year,
          place: item.place,
          dataset: item.dataset,
          exists: answers.exists,
          digital: answers.digital,
          public: answers.public,
          online: answers.online,
          free: answers.free,
          machinereadable: answers.machinereadable,
          bulk: answers.bulk,
          openlicense: answers.openlicense,
          uptodate: answers.uptodate,
          url: answers.url,
          format: answers.format,
          licenseurl: answers.licenseurl,
          dateavailable: answers.dateavailable,
          officialtitle: answers.officialtitle,
          publisher: answers.publisher,
          reviewed: item.reviewed ? 'Yes' : 'No',
          reviewResult: item.reviewResult ? 'Yes' : 'No',
          reviewComments: item.reviewComments,
          details: item.details,
          isCurrent: item.isCurrent ? 'Yes' : 'No',
          isOpen: item.isOpen() ? 'Yes' : 'No',
          submitter: item.Submitter ? item.Submitter.fullName() : '',
          reviewer: item.Reviewer ? item.Reviewer.fullName() : '',
          score: item.computedYCount,
        };
      };

      switch (format) {
        case 'json': {
          outputItemsAsJson(res, results, mapper);
          break;
        }
        case 'csv': {
          var columns = [
            'id',
            'site',
            'timestamp',
            'year',
            'place',
            'dataset',
            'exists',
            'digital',
            'public',
            'online',
            'free',
            'machinereadable',
            'bulk',
            'openlicence',
            'uptodate',
            'url',
            'format',
            'licenseurl',
            'dateavailable',
            'officialtitle',
            'publisher',
            'reviewed',
            'reviewResult',
            'reviewComments',
            'details',
            'isCurrent',
            'isOpen',
            'submitter',
            'reviewer',
            'score',
          ];
          outputItemsAsCsv(res, results, mapper, columns);
          break;
        }
        default: {
          res.sendStatus(404);
          break;
        }
      }
    }).catch(console.trace.bind(console));

};

module.exports = {
  entries: entries,
  datasets: datasets,
  places: places,
  questions: questions,
  faqs: faqs,
  washPlaceLast: washPlaceLast
};
