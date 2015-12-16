'use strict';

var pages = require('./pages');
var census = require('./census');
var submitdata = require('./submitdata');
var api = require('./api');
var admin = require('./admin');
var auth = require('./auth');
var i18n = require('./i18n');
var redirects = require('./redirects');
var utils = require('./utils');

module.exports = {
  pages: pages,
  submitdata: submitdata,
  census: census,
  api: api,
  admin: admin,
  auth: auth,
  i18n: i18n,
  redirects: redirects,
  utils: utils
};
