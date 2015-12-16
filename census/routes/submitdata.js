'use strict';

var submitdata = require('../controllers/submitdata');
var mixins = require('../controllers/mixins');
var utils = require('./utils');

var submitdataRoutes = function(router) {
  var coreMixins = [mixins.requireDomain, mixins.requireAvailableYear,
    mixins.requireAuth];

  router.get(utils.scoped('/submitdata'), coreMixins, submitdata.submit);
  router.post(utils.scoped('/submitdata'), coreMixins, submitdata.submit);
  //router.get(utils.scoped('/submission/:id'),[mixins.requireDomain, mixins.requireAvailableYear], submitdata.pendingEntry);
  //router.post(utils.scoped('/submission/:id'), coreMixins, submitdata.reviewPost);

  return router;
};

module.exports = submitdataRoutes;
