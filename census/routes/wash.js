'use strict';

var wash = require('../controllers/wash');
var mixins = require('../controllers/mixins');
var utils = require('./utils');

var washRoutes = function(router) {
  //var coreMixins = [mixins.requireDomain, mixins.requireAvailableYear,
  //  mixins.requireAuth];
  var coreMixins = [mixins.requireDomain];

  router.get(utils.scoped('/wash/submit'), coreMixins, wash.submitWash);
  router.post(utils.scoped('/wash/submit'), coreMixins, wash.submitWash);

  return router;
};

module.exports = washRoutes;
