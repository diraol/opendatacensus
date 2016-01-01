'use strict';

var wash = require('../controllers/wash');
var mixins = require('../controllers/mixins');
var utils = require('./utils');

var washRoutes = function(router) {
  var coreMixins = [mixins.requireDomain, mixins.requireAvailableYear,
    mixins.requireAuth];

  router.get(utils.scoped('/wash/submit'), coreMixins, wash.submitWash);
  router.post(utils.scoped('/wash/submit'), coreMixins, wash.submitWash);
  //router.get(utils.scoped('/wash/:id'),[mixins.requireDomain, mixins.requireAvailableYear], wash.pendingEntry);
  //router.post(utils.scoped('/wash/:id'), coreMixins, wash.reviewPost);

  return router;
};

module.exports = washRoutes;
