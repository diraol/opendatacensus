'use strict';

var _ = require('lodash');
var modelUtils = require('../models/utils');
var FIELD_SPLITTER = /[\s,]+/;
var ANONYMOUS_USER_ID = process.env.ANONYMOUS_USER_ID ||
  '0e7c393e-71dd-4368-93a9-fcfff59f9fff';
var marked = require('marked');

var makeChoiceValidator = function(param) {
  return function(req) {
    req.checkBody(param, 'You must make a valid choice').isChoice();
  };
};

var validators = {
  exists: {
    validate: makeChoiceValidator('exists'),
    require: ['digital', 'public', 'uptodate']
  },
  digital: {
    validate: makeChoiceValidator('digital'),
    require: ['online', 'machinereadable', 'bulk'],
    expectFalse: ['online', 'machinereadable', 'bulk']
  },
  public: {
    validate: makeChoiceValidator('public'),
    require: ['free'],
    expectFalse: ['free', 'online', 'openlicense', 'bulk']
  },
  free: {
    validate: makeChoiceValidator('free'),
    require: ['openlicense'],
    expectFalse: ['openlicense']
  },
  online: {
    validate: makeChoiceValidator('online'),
    require: ['url']
  },
  openlicense: {
    validate: makeChoiceValidator('openlicense'),
    require: ['licenseurl']
  },
  machinereadable: {
    validate: makeChoiceValidator('machinereadable'),
    require: ['format']
  },
  bulk: {
    validate: makeChoiceValidator('bulk')
  },
  uptodate: {
    validate: makeChoiceValidator('uptodate')
  },
  format: {
    type: 'string',
    validate: function(req) {
      req.checkBody('format', 'You must specify the data format').notEmpty();
    }
  },
  url: {
    type: 'string',
    validate: function(req) {
      req.checkBody('url', 'You must specify a valid URL').isURL();
    }
  },
  licenseurl: {
    type: 'string',
    validate: function(req) {
      req.checkBody('licenseurl', 'You must specify a valid URL').isURL();
    }
  }
};

var validateQuestion = function(req, question, parentQuestion, validated) {
  /**
   * Validate the question.
   *
   * If the answer is positive ("true") validate the field with all
   * possible values.
   *
   * If it's "false":
   *
   *  * check that all the "expectFalse" question values are "false".
   *
   * Then if the answer is negative ("false" or "null"):
   *
   *  * check all the required fields have the same values as its
   *    parent ("false" or "null") unless the field's type is string,
   *    in that case ensure that the string is empty.
   *
   * Iterate over the required questions recursively.
   */

  parentQuestion = parentQuestion || null;
  validated = validated || [];
  var validator = validators[question];
  var value = req.body[question];
  var parentValue = req.body[parentQuestion] || 'true';

  if (value === undefined) {
    req.checkBody(question, 'You must specify ' + question).equals('any');
  }

  // ensure false values for expectFalse questions
  if (value === 'false' && validator.expectFalse) {
    validator.expectFalse.forEach(function(child) {
      if (validated.indexOf(child) == -1) {
        req.checkBody(child, 'You can specify only \'false\'').equals('false');
        validated.push(child);
      }
    });
  }

  if (validated.indexOf(question) == -1) {
    // not yet validated
    // validate depending on the question value
    if (parentValue === 'null' || parentValue === 'false') {
      // validate falsy values
      if (validator.type === 'string') {
        req.checkBody(question, 'You must not specify this field').equals('');
      } else {
        if (!(
          (parentValue === 'null') && (validators[parentQuestion].expectFalse))
        ) {
          req.checkBody(question, 'You can specify only \'' +
            parentValue + '\'').equals(parentValue);
        }
      }
    } else {
      // parentValue has a truthy value, validate as normal
      validator.validate(req);
    }
    validated.push(question);
  }

  // validate recursively
  if (validator.require) {
    validator.require.forEach(function(child) {
      validateQuestion(req, child, question, validated);
    });
  }
};

var validateData = function(req, mappedErrors) {
  /**
   * Ensures validation data is submitted by checking the POST data on
   * req.body according to the declared validation logic.
   * Used for new data submissions, and revision proposals.
   */
  var errors;
  var mapped = mappedErrors || false;

  req.checkBody('place', 'You must select a Place').notEmpty();
  req.checkBody('dataset', 'You must select a Dataset').notEmpty();

  validateQuestion(req, 'exists');

  errors = req.validationErrors(mapped);

  return errors;
};

var splitFields = function(data) {
  return _.each(data.trim().split(FIELD_SPLITTER), function(str) {
    str.trim();
  });
};

var placeMapper = function(data) {
  var reviewers = [];
  if (data.reviewers) {
    reviewers = splitFields(data.reviewers);
  }
  return _.defaults({
    id: data.id.toLowerCase(),
    reviewers: reviewers
  }, data);
};

var datasetMapper = function(data) {
  var reviewers = [];
  if (data.reviewers) {
    reviewers = splitFields(data.reviewers);
  }
  return _.defaults({
    id: data.id.toLowerCase(),
    description: marked(data.description),
    name: data.title,
    order: data.order || 100,
    reviewers: reviewers
  }, data);
};

var questionMapper = function(data) {
  var dependants = null;
  if (data.dependants) {
    dependants = splitFields(data.dependants);
  }
  return _.defaults({
    id: data.id.toLowerCase(),
    description: marked(data.description),
    dependants: dependants,
    score: data.score || 0,
    order: data.order || 100
  }, data);
};

var faqMapper = function(data) {
  return _.defaults({
    priority: data.priority,
    question: marked(data.question),
    answer: marked(data.answer),
    dataviz: data.dataviz || ''
  }, data);
};

var normalizedAnswers = function(answers) {
  var normed = {};
  _.each(answers, function(v, k) {
    if (v === 'true') {
      normed[k] = true;
    } else if (v === 'false') {
      normed[k] = false;
    } else if (v === 'null') {
      normed[k] = null;
    } else {
      normed[k] = v;
    }
  });
  return normed;
};

var ynuAnswers = function(answers) {
  var ynu = {};
  _.each(answers, function(v, k) {
    if (v === null) {
      ynu[k] = 'Unsure';
    } else if (v === false) {
      ynu[k] = 'No';
    } else if (v === true) {
      ynu[k] = 'Yes';
    } else {
      ynu[k] = v;
    }
  });
  return ynu;
};

var getFormQuestions = function(req, questions) {
  questions = modelUtils.translateSet(req, questions);
  _.each(questions, function(q) {
    if (q.dependants) {
      _.each(q.dependants, function(d, i, l) {
        var match = _.find(questions, function(o) {
          return o.id === d;
        });
        l[i] = match;
        questions = _.reject(questions, function(o) {
          return o.id === match.id;
        });
      });
    }

  });
  return _.sortByOrder(questions, 'order', 'asc');
};

var getCurrentState = function(data, req) {
  var match = _.merge(req.query, req.body);
  var pending;
  var matches;

  if (!match.place || !match.dataset) {
    match = {};
  } else {
    matches = _.filter(data.entries, {
      isCurrent: true,
      place: match.place,
      dataset: match.dataset
    });
    pending = _.any(data.pending, {
      isCurrent: false,
      year: req.params.year,
      place: match.place,
      dataset: match.dataset
    });
    if (matches.length) {
      match = _.first(matches);
    }
  }
  return {
    match: match,
    pending: pending
  };
};

var getReviewers = function(req, data) {
  var reviewers = [];
  if (!req.user) {
    return reviewers;
  } else {
    if (req.params.site.settings.reviewers) {
      reviewers = reviewers.concat(req.params.site.settings.reviewers);
    }
    if (data.place.reviewers) {
      reviewers = reviewers.concat(data.place.reviewers);
    }
    if (data.dataset.reviewers) {
      reviewers = reviewers.concat(data.dataset.reviewers);
    }
    return reviewers;
  }
};

var canReview = function(reviewers, user) {
  if (user) {
    return (_.intersection(reviewers, user.emails).length >= 1);
  }
  return false;
};

var washForCard = function(data) {
    /*
     * This method generates the needed output to fill the WASH CARD
     * both for the web view and the print view.
     * It is also used on the API endpoint that exposes this JSON
     */
  // TODO: Read this hardcoded data from spreadsheet
  var indicators_references = {
      SAM: {
          POOR: { min_value: 15, max_value: 100, score: 1 },
          AVERAGE: { min_value: 5, max_value: 15, score: 2 },
          GOOD: { min_value: 0, max_value: 5, score: 3 }
      },
      GAM: {
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
                        'lastUpdateGAM',
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
      indicators.GAM.name = 'Malnutrition Rate (Underweight)';
      indicators.GAM.current = _.assign({ value: currentData.GAM}, evaluate_indicator('GAM', currentData.GAM));
      indicators.GAM.previous = _.assign({ value: previousData.GAM}, evaluate_indicator('GAM', previousData.GAM));
      indicators.GAM.allValues = _.cloneDeep( baseAllValues );
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
          date = data.lastUpdateGAM;
          value = data.GAM ? data.GAM : undefined;
          if (date != undefined & value >= 0) indicators.GAM.allValues[allDates.indexOf(dateToMonthYear(date, 'allDates'))] = value;
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
          indicators.GAM.current.score == 1 &&
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
      if (indicators.GAM.current.score == 1 &&
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
  if (!_.isEmpty( data.washs )){

    var washOutput = {
        placeID: undefined,
        placeName: undefined,
        placeType: undefined,
        region: undefined,
        indicators: {
            SAM:  { name: undefined,
                    current: { value: undefined, score: undefined, label: undefined },
                    previous: { value: undefined, score: undefined, label: undefined },
                    allValues: [] // ordered list with n items,
                                    //n equals the max number of dates for all indicators
            },
            GAM:  { name: undefined,
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

    return washOutput;

  }
  return {}
}

module.exports = {
  validateData: validateData,
  placeMapper: placeMapper,
  datasetMapper: datasetMapper,
  questionMapper: questionMapper,
  faqMapper: faqMapper,
  normalizedAnswers: normalizedAnswers,
  ynuAnswers: ynuAnswers,
  getFormQuestions: getFormQuestions,
  getCurrentState: getCurrentState,
  getReviewers: getReviewers,
  canReview: canReview,
  washForCard: washForCard,
  FIELD_SPLITTER: FIELD_SPLITTER,
  ANONYMOUS_USER_ID: ANONYMOUS_USER_ID
};
