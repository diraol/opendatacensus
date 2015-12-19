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

    var results = [];

    var columns = [
      'site',
      'place',
      'placeId',
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
      results[0]['place'] = data.place.dataValues.name;
      //delete results[0]['id'];
    } else if (data.washs) {
        for (var item in data.washs) {
            var insert = data.washs[item].dataValues;
            insert['placeId'] = insert.place;
            insert['place'] = data.place.dataValues.name;
            //delete insert.id;
            results.push(insert);
        }
    }
    var indicators_references = {
        'SAM': {
            'POOR': { 'min_value': 15, 'max_value': 100, 'score': 1 },
            'AVERAGE': { 'min_value': 5, 'max_value': 15, 'score': 2 },
            'GOOD': { 'min_value': 0, 'max_value': 5, 'score': 3 }
        },
        'GAN': {
            'POOR': { 'min_value': 15, 'max_value': 100, 'score': 1 },
            'AVERAGE': { 'min_value': 5, 'max_value': 15, 'score': 2 },
            'GOOD': { 'min_value': 0, 'max_value': 5, 'score': 3 }
        },
        'ADD': {
            'POOR': { 'min_value': 15, 'max_value': 100, 'score': 1 },
            'AVERAGE': { 'min_value': 5, 'max_value': 15, 'score': 2 },
            'GOOD': { 'min_value': 0, 'max_value': 5, 'score': 3 }
        },
        'HWAT': {
            'POOR': { 'min_value': 50, 'max_value': 100000000, 'score': 1 },
            'AVERAGE': { 'min_value': 20, 'max_value': 50, 'score': 2 },
            'GOOD': { 'min_value': 0, 'max_value': 20, 'score': 3 }
        },
        'HWAW': {
            'POOR': { 'min_value': 50, 'max_value': 100000000, 'score': 1 },
            'AVERAGE': { 'min_value': 20, 'max_value': 50, 'score': 2 },
            'GOOD': { 'min_value': 0, 'max_value': 20, 'score': 3 }
        },
        'WSC': {
            'POOR': { 'min_value': 15, 'max_value': 100, 'score': 1 },
            'AVERAGE': { 'min_value': 5, 'max_value': 15, 'score': 2 },
            'GOOD': { 'min_value': 0, 'max_value': 5, 'score': 3 }
        },
        'EXND': {
            'POOR': { 'min_value': 15, 'max_value': 100, 'score': 1 },
            'AVERAGE': { 'min_value': 5, 'max_value': 15, 'score': 2 },
            'GOOD': { 'min_value': 0, 'max_value': 5, 'score': 3 }
            //'HIGH': { 'lablel': 'POOR', 'score': 1 },
            //'MODERATE': { 'label': 'AVERAGE', 'score': 2 },
            //'LOW': { 'label': 'GOOD', 'score': 3 }
        }
    }

    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

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

    var calculate_preparedness = function(indicators) {
        var index_sum = 0;
        var output = {};
        for (var indicator in indicators) {
            index_sum = index_sum + indicators[indicator].current.score;
        }
        if (index_sum <= 14) {
            output = {
                'value': index_sum,
                'label': 'Poorly resiliente',
                'title': 'Have a lot of work to do'
            };
        } else if (index_sum <= 17) {
            output = {
                'value': index_sum,
                'label': 'Moderately resilient',
                'title': 'Not Bad!'
            };
        } else {
            output = {
                'value': index_sum,
                'label': 'Highly resilient',
                'title': 'Congratulations'
            }
        }
        return output;
    }

    var washCheckNoneGood = function(indicators) {
        var noneGood = true;
        for (var indicator in indicators) {
            if (indicators[indicator].current.score == 3) {
                noneGood = false;
            }
        }
        return noneGood;
    }

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

    var washGetWarnings = function(indicators) {
        var messages = [];
        for (var indicator in indicators) {
            //console.log(indicators);
            var current = indicators[indicator].current,
                previous = indicators[indicator].last;
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

    var washGetPositives = function(indicators) {
        var messages = [];
        for (var indicator in indicators) {
            var current = indicators[indicator].current,
                previous = indicators[indicator].last;
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

    var washChartData = function(indicators) {
        var data = {
            categories: [],
            series: []

        }
        for (var indicator in indicators) {
          if (indicator != 'HWAW' && indicator != 'HWAT') {
            data.categories.push(indicator);
            data.series.push({
                name: indicator, //indicators[indicator].name,
                data: [indicators[indicator].current.value]
            });
          }
        }
        return data;
    }

    // Creating the output variable, mainly to define its format.
    var washOutput = {
        placeID: undefined,
        placeName: undefined,
        indicators: {
            SAM:  { name: undefined, current: { value: undefined, score: undefined, label: undefined }, last: { value: undefined, score: undefined, label: undefined } },
            GAN:  { name: undefined, current: { value: undefined, score: undefined, label: undefined }, last: { value: undefined, score: undefined, label: undefined } },
            ADD:  { name: undefined, current: { value: undefined, score: undefined, label: undefined }, last: { value: undefined, score: undefined, label: undefined } },
            HWAT: { name: undefined, current: { value: undefined, score: undefined, label: undefined }, last: { value: undefined, score: undefined, label: undefined } },
            HWAW: { name: undefined, current: { value: undefined, score: undefined, label: undefined }, last: { value: undefined, score: undefined, label: undefined } },
            WSC:  { name: undefined, current: { value: undefined, score: undefined, label: undefined }, last: { value: undefined, score: undefined, label: undefined } },
            EXND: { name: undefined, current: { value: undefined, score: undefined, label: undefined }, last: { value: undefined, score: undefined, label: undefined } }
        },
        preparedness: { value: undefined, label: undefined, title: undefined },
        lastUpdate: { name: undefined, role: undefined, org: undefined, date: undefined },
        allGood: false,
        noneGood: true,
        improveScoreMessage: undefined,
        goodToKnowMessages: [],
        warningMessages: [],
        positiveMessages: [],
        chart: {
            categories: undefined,
            series: undefined
        }
    }

    var place = data.place.dataValues,
        currentData = data.washs[0].dataValues,
        previousData = data.washs[1].dataValues;

    washOutput.placeID = place.id;
    washOutput.placeName = place.name;
    washOutput.indicators = {
        SAM:  {
            'name': 'Malnutrition Rate (Stunting)',
            'current': _.assign({ value: currentData.SAM}, evaluate_indicator('SAM', currentData.SAM)),
            'last': _.assign({ value: previousData.SAM}, evaluate_indicator('SAM', previousData.SAM))
        },
        GAN:  {
            name: 'Malnutrition Rate (Underweight)',
            current: _.assign({ value: currentData.GAN}, evaluate_indicator('GAN', currentData.GAN)),
            last: _.assign({ value: previousData.GAN}, evaluate_indicator('GAN', previousData.GAN))
        },
        ADD:  {
            name: 'Acute Diarrhoeal Disease (Prevalence)',
            current: _.assign({ value: currentData.ADD}, evaluate_indicator('ADD', currentData.ADD)),
            last: _.assign({ value: previousData.ADD}, evaluate_indicator('ADD', previousData.ADD))
        },
        HWAT: {
            name: 'Households without access to toilet',
            current: _.assign({ value: currentData.HWAT}, evaluate_indicator('HWAT', currentData.HWAT)),
            last: _.assign({ value: previousData.HWAT}, evaluate_indicator('HWAT', previousData.HWAT))
        },
        HWAW: {
            name: 'Households without access to water',
            current: _.assign({ value: currentData.HWAW}, evaluate_indicator('HWAW', currentData.HWAW)),
            last: _.assign({ value: previousData.HWAW}, evaluate_indicator('HWAW', previousData.HWAW))
        },
        WSC:  {
            name: '% of water sources positive with e.coli and other contaminants',
            current: _.assign({ value: currentData.WSC}, evaluate_indicator('WSC', currentData.WSC)),
            last: _.assign({ value: previousData.WSC}, evaluate_indicator('WSC', previousData.WSC))
        },
        EXND: {
            name: 'Exposure to natural disasters (number of incidents reported)',
            current: _.assign({ value: currentData.EXND}, evaluate_indicator('EXND', currentData.EXND)),
            last: _.assign({ value: previousData.EXND}, evaluate_indicator('EXND', previousData.EXND))
        }
    };
    washOutput.preparedness = calculate_preparedness(washOutput.indicators);
    washOutput.lastUpdate.name = currentData.name;
    washOutput.lastUpdate.role = currentData.role;
    washOutput.lastUpdate.email = currentData.email[0];
    // Converting the date to Month/Year
    var createdAt = new Date(data.createdAt);
    createdAt = monthNames[createdAt.getMonth()] +
                "/" +
                createdAt.getFullYear();
    washOutput.lastUpdate.date = currentData.createdAt;
    washOutput.allGood = washOutput.preparedness.value == 21 ? true : false;
    washOutput.noneGood = washCheckNoneGood(washOutput.indicators);
    washOutput.improveScoreMessage = washImproveMessage(washOutput.allGood, washOutput.noneGood, washOutput.indicators);
    washOutput.goodToKnowMessages = washGoodToKnow(washOutput.indicators);
    washOutput.warningMessages = washGetWarnings(washOutput.indicators);
    washOutput.positiveMessages = washGetPositives(washOutput.indicators);

    washOutput.chart = washChartData(washOutput.indicators);

    var mapper = function(item) {
      var result = {};
      _.each(columns, function(name) {
        result[name] = item[name];
      });
      return result;
    };

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
