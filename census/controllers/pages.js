'use strict';

var _ = require('lodash');
var marked = require('marked');
var modelUtils = require('../models').utils;
var Promise = require('bluebird');

var faq_md = function(req, res) {
  var qTmpl = req.app.get('view_env').getTemplate('_snippets/questions.html');
  var dTmpl = req.app.get('view_env').getTemplate('_snippets/datasets.html');
  var dataOptions = _.merge(modelUtils.getDataOptions(req), {
    with: {
      Entry: false,
      Place: false
    }
  });
  var gettext = res.locals.gettext;

  modelUtils.getData(dataOptions)
    .then(function(data) {
      var qContent = qTmpl.render({
        gettext: gettext,
        questions: data.questions
      });
      var dContent = dTmpl.render({
        gettext: gettext,
        datasets: data.datasets
      });
      var settingName = 'missing_place_html';
      var mContent = req.params.site.settings[settingName];
      data.title = 'FAQ - Frequently Asked Questions';
      settingName = 'faq_page';
      data.content = marked(req.params.site.settings[settingName])
        .replace('{{questions}}', qContent)
        .replace('{{datasets}}', dContent)
        .replace('{{missing_place}}', mContent);
      data.url_home = true;
      return res.render('base.html', data);
    }).catch(console.trace.bind(console));
};

var changes = function(req, res) {
  var dataOptions = _.merge(modelUtils.getDataOptions(req), {cascade: false});

  modelUtils.getData(dataOptions)
    .then(function(data) {
      data.loggedin = req.session.loggedin;
      data.year = req.app.get('year');
      data.items = _.sortByOrder(data.entries
        .concat(data.pending)
        .concat(data.rejected), 'updatedAt', 'desc');
      data.url_home = true;
      res.render('changes.html', data);
    }).catch(console.trace.bind(console));
};


var wash = function(req, res) {
  var settingName = 'wash_submitdata_page';
  res.render('wash.html', {
    //content: marked(req.params.site.settings[settingName]),
    title: 'Submit WASH Data'
  });
};

var contribute = function(req, res) {
  var settingName = 'contribute_page';
  res.render('base.html', {
    content: marked(req.params.site.settings[settingName]),
    title: 'Contribute'
  });
};

var tutorial = function(req, res) {
  var settingName = 'tutorial_page';
  res.render('base.html', {
    content: marked(req.params.site.settings[settingName]),
    title: 'Tutorial',
    url_home: true
  });
};

var about = function(req, res) {
  var settingName = 'about_page';
  res.render('about.html', {
    content: marked(req.params.site.settings[settingName]),
    title: 'About',
    url_about: true
  });
};

var overview = function(req, res) {
  /**
   * An overview of data, optionally by year.
   */
  var settingOverviewPage = 'overview_page';
  var settingMissingPlace = 'missing_place_html';
  modelUtils.getData(modelUtils.getDataOptions(req))
    .then(function(data) {
      data.urlContext = '';
      if (!req.params.cascade) {
        data.urlContext += '/YEAR'.replace('YEAR', req.params.year);
      }
      data.submissionsAllowed = (req.params.year === req.app.get('year'));
      data.extraWidth = data.datasets.length > 15;
      data.customText = req.params.site.settings[settingOverviewPage];
      data.missingPlaceText = req.params.site.settings[settingMissingPlace];
      data.url_index = true;
      return res.render('overview.html', data);
    }).catch(console.trace.bind(console));
};

var home = function(req, res) {
  /**
   * Home of the Preparedness Data Dashboard (Landing Page).
   */
  modelUtils.getData(modelUtils.getDataOptions(req))
    .then(function(data) {
      var settingName = 'description';
      data.title = req.params.site.settings['title'];
      data.content = marked(req.params.site.settings[settingName]);
      data.places = modelUtils.translateSet(req, data.places);
      data.url_home = true;
      res.render('home.html', data);
    }).catch(console.trace.bind(console));

      //return res.render('home.html', data);
};

var faq = function(req, res) {
  /**
    * FAQ cards
    */

  modelUtils.getData(modelUtils.getDataOptions(req))
    .then(function(data) {
      var settingName = 'faq_page';
      data.title = 'FAQ - Frequently Asked Questions';
      data.desc = marked(req.params.site.settings[settingName]);
      data.url_faq = true;
      res.render('faq.html', data);
  }).catch(console.trace.bind(console));
};

var place = function(req, res) {
  /**
   * An overview of places, optionally by year.
   */
  modelUtils.getData(modelUtils.getDataOptions(req))
    .then(function(data) {
      if (!data.place) {
        return res.status(404)
          .send('There is no matching place in our database. ' +
            'Are you sure you have spelled it correctly? Please check the ' +
            '<a href="/">overview page</a> for the list of places');
      }

      data.urlContext = '';
      if (!req.params.cascade) {
        data.urlContext += '/YEAR'.replace('YEAR', req.params.year);
      }
      data.loggedin = req.session.loggedin;
      data.year = req.params.year;
      data.submissionsAllowed = (req.params.year === req.app.get('year'));
      data.extraWidth = data.datasets.length > 12;
      data.url_home = true;
      return res.render('place.html', data);
    }).catch(console.trace.bind(console));
};

var dataset = function(req, res) {
  /**
   * An overview of datasets, optionally by year.
   */
  modelUtils.getData(modelUtils.getDataOptions(req))
    .then(function(data) {
      if (!data.dataset) {
        return res.status(404)
          .send('There is no matching dataset in our database. ' +
            'Are you sure you have spelled it correctly? Please check the ' +
            '<a href="/">overview page</a> for the list of places');
      }

      data.urlContext = '';
      if (!req.params.cascade) {
        data.urlContext += '/YEAR'.replace('YEAR', req.params.year);
      }
      data.loggedin = req.session.loggedin;
      data.year = req.params.year;
      data.submissionsAllowed = req.params.year === req.app.get('year');
      data.url_home = true;
      return res.render('dataset.html', data);
    }).catch(console.trace.bind(console));
};

var entry = function(req, res) {
  /**
   * An overview of the current entry for a place/dataset, optionally by year.
   */
  var dataOptions = _.merge(modelUtils.getDataOptions(req), {
    ynQuestions: false
  });

  modelUtils.getData(dataOptions)
    .then(function(data) {
      data.entry = _.first(data.entries);
      if (!data.entry) {
        return res.status(404)
          .send('There is no matching entry in our database. ' +
            'Are you sure you have spelled it correctly? Please check the ' +
            '<a href="/">overview page</a> for the list of places');
      }

      data.urlContext = '';
      if (!req.params.cascade) {
        data.urlContext += '/YEAR'.replace('YEAR', req.params.year);
      }
      data.year = req.params.year;
      data.submissionsAllowed = req.params.year === req.app.get('year');
      data.url_home = true;
      return res.render('entry.html', data);
    }).catch(console.trace.bind(console));
};

module.exports = {
  home: home,
  overview: overview,
  faq: faq,
  about: about,
  wash: wash,
  contribute: contribute,
  tutorial: tutorial,
  changes: changes,
  place: place,
  dataset: dataset,
  entry: entry
};
