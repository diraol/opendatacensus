'use strict';

var _ = require('lodash');
var marked = require('marked');
var config = require('../config');
var uuid = require('node-uuid');
var utils = require('./utils');
var modelUtils = require('../models').utils;

var submitWashGetHandler = function(req, res, data) {

  var settingName = 'wash_submit_page';
  var submitInstructions = req.params.site.settings[settingName];
  res.render('wash.html', {
    places: modelUtils.translateSet(req, data.places),
    submittedMessage: req.query.sm === 't'
  });
};

var submitWashPostHandler = function(req, res, data) {
  if (req.body.from && req.body.from == "washCard") {
    // PreLoad the data for the given place
    var currentPlace = req.body.place;
    delete req.body.from;

    var settingName = 'wash_submit_page';
    res.render('wash.html', {
      places: modelUtils.translateSet(req, data.places),
      current: {place: currentPlace}
    });

  } else {

    var errors;
    var objToSave = {};
    var answers;
    var saveStrategy;
    var anonymous = true;
    var submitterId = utils.ANONYMOUS_USER_ID;
    var query;
    var current;
    if (data.washs[0]) current = data.washs[0].dataValues;

    errors = utils.validateWashData(req);

    if (errors) {

      res.statusCode = 400;
      var settingName = 'wash_submit_page';

      res.render('wash.html', {
        places: modelUtils.translateSet(req, data.places),
        placeId: req.body.place,
        errors: errors,
        formData: req.body
      });
    } else {
      if (req.body.anonymous && req.body.anonymous === 'false') {
        anonymous = false;
        submitterId = req.user.id;
      }

      if (!current || current.year !== req.app.get('year')) {
        console.log('we are definitely creating a new entry');

        objToSave.id = uuid.v4();
        objToSave.site = req.params.site.id;
        objToSave.place = req.body.place;
        objToSave.SAM = req.body.SAM ? req.body.SAM : undefined;
        objToSave.lastUpdateSAM = req.body.lastUpdateSAM ? req.body.lastUpdateSAM : undefined;
        objToSave.GAM = req.body.GAM ? req.body.GAM : undefined;
        objToSave.lastUpdateGAM = req.body.lastUpdateGAM ? req.body.lastUpdateGAM : undefined;
        objToSave.ADD = req.body.ADD ? req.body.ADD : undefined;
        objToSave.lastUpdateADD = req.body.lastUpdateADD ? req.body.lastUpdateADD : undefined;
        objToSave.HWAT = req.body.HWAT ? req.body.HWAT : undefined;
        objToSave.lastUpdateHWAT = req.body.lastUpdateHWAT ? req.body.lastUpdateHWAT : undefined;
        objToSave.HWAW = req.body.HWAW ? req.body.HWAW : undefined;
        objToSave.lastUpdateHWAW = req.body.lastUpdateHWAW ? req.body.lastUpdateHWAW : undefined;
        objToSave.WSC = req.body.WSC ? req.body.WSC : undefined;
        objToSave.lastUpdateWSC = req.body.lastUpdateWSC ? req.body.lastUpdateWSC : undefined;
        objToSave.EXND = req.body.EXND ? req.body.EXND : undefined;
        objToSave.lastUpdateEXND = req.body.lastUpdateEXND ? req.body.lastUpdateEXND : undefined;
        objToSave.name = req.body.inputName;
        objToSave.organization = req.body.inputOrganization;
        objToSave.role = req.body.inputRole;
        objToSave.email = req.body.inputEmail;
        objToSave.createdAt = Date.now();
        objToSave.updatedAt = Date.now();

        saveStrategy = 'create';
      } else if (current.isCurrent) {
        console.log('we have existing current entry, so create a new submission');

        objToSave.id = uuid.v4();
        objToSave.site = req.params.site.id;
        objToSave.place = req.body.place;

        saveStrategy = 'create';
      } else {
        console.log('we have existing submission and no current entry. we ' +
          'usually should not get here because of earlier condition that ' +
          'lodges a conflict error on the form');

        objToSave = current;

        saveStrategy = 'update';
      }

      if (saveStrategy === 'create') {
        query = req.app.get('models').Wash.create(objToSave);
      } else if (saveStrategy === 'update') {
        query = objToSave.save();
      }

      query.then(function(result) {
        var msg;
        var msgTmpl;
        var redirectPath;
        var submissionPath;

        if (!result) {
          msg = 'There was an error!';
          req.flash('error', msg);
        } else {
          msgTmpl = 'Thanks for your submission.';

          redirectPath = '/wash/submit/?sm=t';
        }
        res.redirect(redirectPath);
      }).catch(console.trace.bind(console));
    }
  }
};

var submitWash = function(req, res) {
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
          Places: false,
          Wash: true
      }
    }
  );

  modelUtils.getData(dataOptions)
    .then(function(data) {
      if (req.method === 'POST') {
        submitWashPostHandler(req, res, data);
      } else {
        submitWashGetHandler(req, res, data);
      }
    }).catch(console.trace.bind(console));
};


module.exports = {
  submitWash: submitWash,
};
