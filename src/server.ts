// Load configs
import * as nconf from 'nconf';
loadConfigs(nconf);

// Load modules
import * as express from 'express';
import { API } from './api';

const app = express();

// ============================== CONFIGURE APP ============================= //

// configure express app
app.set('host', nconf.get('HOST'));
app.set('view engine', 'html');

if (!nconf.get('SECRET')) {
  console.log('You must provide a SECRET for the cookiestore in your config.');
  console.log('Add a secret one of three ways:');
  console.log('  1. Command `SECRET=thisSecret gulp dev`');
  console.log('  2. Put "SECRET=thisSecret" in the .env file');
  console.log('  3. Add \'"SECRET": "thisSecret"\' to config/settings.json');
  process.exit();
}

app.use(require('cookie-session')({ secret: nconf.get('SECRET') }));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('body-parser').json());

// configure methods to log route
configureMethod(app, 'get');
configureMethod(app, 'put');
configureMethod(app, 'post');
configureMethod(app, 'delete');

// start app
app.listen(nconf.get('PORT'), function() {
  console.log('App listening on port %s', nconf.get('PORT'));

  // Configure api
  API(app);

  // Ping route
  app.get('/ping', function(req, res, next) {
    res.send('ping');
  });

  // Everything else
  app.get('/*', function(req, res, next) {
    res.send('hello');
  });
});

// ================================= TOOLS ================================== //

function configureMethod(app, method) {
  let m = app[method];

  app[method] = function(path) {
    if (arguments.length < 2) return m.apply(this, arguments);
    console.log('%s route:', method, path);
    return m.apply(this, arguments);
  };
}

function loadConfigs(nconf) {
  nconf
    .argv()  // overrides everything
    .env()   // overrides config file
    .file({ file: __dirname + '/../config/settings.json' });
  nconf.set('lib', __dirname + '/app');
  nconf.set('PORT', '5000');
  nconf.set('HOST', '127.0.0.1');
  return nconf;
}
