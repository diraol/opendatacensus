'use strict';

function start() {

  var _ = require('lodash');
  var path = require('path');
  var express = require('express');
  var subdomain = require('subdomain');
  var session = require('cookie-session');
  var cookieParser = require('cookie-parser');
  var bodyParser = require('body-parser');
  var methodOverride = require('method-override');
  var cors = require('cors');
  var favicon = require('serve-favicon');
  var flash = require('connect-flash');
  var compression = require('compression');
  var expressValidator = require('express-validator');
  var passport = require('passport');
  var config = require('./config');
  var i18n = require('i18n-abide');
  var routes = require('./routes');
  var nunjucks = require('nunjucks');
  var nunjucksGlobals = require('nunjucks/src/globals');
  var raven = require('raven');
  var Promise = require('bluebird');
  var env;
  var templateFilters = require('./filters');
  var app = express();
  var cacheAge = 3600 * 1000; // in milliseconds
  var staticRoot = path.join(__dirname, 'public');
  var sessionSecret = process.env.SESSION_SECRET || 'dummysecret';
  var viewPath = __dirname + '/views';
  var faviconPath = __dirname + '/public/favicon.ico';
  var models = require('./models');
  var middlewares = require('./middlewares');
  var currentYear = new Date().getFullYear();
  var startYear = 2013;
  var availableYears = _.range(startYear, currentYear + 1);
  var rawSysAdmin = process.env.SYS_ADMIN || config.get('sysAdmin') || '';
  var sysAdmin = _.each(rawSysAdmin.split(','), function(e, i, l) {
    l[i] = e.trim(); return;
  });

  var subdomainOptions = {
    base: config.get('base_domain')
  };
  var validatorOptions = {
    customValidators: {
      isChoice: function(value) {
        var choices = ['true', 'false', 'null'];
        if (choices.indexOf(value) > -1) {
          return true;
        } else {
          return false;
        }
      }
    }
  };

  app.set('config', config);
  app.set('port', config.get('appconfig:port'));
  app.set('views', viewPath);
  app.set('models', models);
  app.set('year', currentYear);
  app.set('years', availableYears);
  app.set('sysAdmin', sysAdmin);
  app.set('authDomain', config.get('auth_subdomain'));
  app.set('systemDomain', config.get('system_subdomain'));
  app.set('urlTmpl', config.get('urlTmpl'));
  if (process.env.GOOGLE_SITE_VERIFICATION) {
    app.set('googleSiteVerification', process.env.GOOGLE_SITE_VERIFICATION);
  }

  env = nunjucks.configure('census/views', {
    autoescape: false,
    express: app
  });

  env.addGlobal('currentTime', Date.now());

  _.each(templateFilters, function(value, key, list) {
    env.addFilter(key, value);
  });

  app.set('view_env', env);

  app.use([
    raven.middleware.express.requestHandler(config.get('sentry_dsn')),
    raven.middleware.express.errorHandler(config.get('sentry_dsn')),
    cookieParser(),
    bodyParser.urlencoded({extended: true}),
    bodyParser.json(),
    methodOverride(),
    session({
      name: 'session',
      secret: sessionSecret,
      domain: '.BASE'.replace('BASE', config.get('base_domain').split(':')[0]),
      maxAge: 1000 * 60 * 60 * 24 * 30 * 12 // one year(ish)
    }),
    passport.initialize(),
    passport.session(),
    flash(),
    i18n.abide({
      'supported_languages': config.get('availableLocales'),
      'default_lang': _.first(config.get('locales')),
      'translation_directory': 'census/locale/'
    }),
    express.static(staticRoot, {maxage: cacheAge})
  ]);

  var coreMiddlewares = [
    expressValidator(validatorOptions),
    cors(),
    compression(),
    favicon(faviconPath),
    subdomain(subdomainOptions)
  ];

  app.all('*', routes.utils.setLocals);
  app.use('/setlocale', routes.i18n(coreMiddlewares));
  app.use('/admin', routes.admin(coreMiddlewares));
  app.use('/api', routes.api(coreMiddlewares));
  // pages also has census, auth and redirect routes
  app.use('', routes.pages(coreMiddlewares));
  app.use(middlewares.notFound);
  app.use(middlewares.internalServerError);

  routes.utils.setupAuth();

  return new Promise(function(resolve, reject) {
    app.get('models').umzug.up().then(function() {
      var server = app.listen(app.get('port'), function() {
        console.log('Listening on ' + app.get('port'));
        resolve({
          app: app,
          server: server
        });
      });
    }).catch(reject);
  });
}

module.exports = {
  start: start
};
