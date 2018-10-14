import * as nconf from 'nconf';
import * as turnkey from 'turnkey';
import * as mongoose from 'mongoose';
import * as crud from 'node-crud';
import * as tools from './tools';

const resources = require('require-dir')('./resources');

export function API(app) {
  const url = nconf.get('MONGO_URL');

  // set up auth here //
  turnkey.launch({
    logger: console.log.bind(console),
    router: app,
    model: resources.users.Model,
    cors: nconf.get('cors'),
    usernameKey: 'email',
    verificationOn: true,
    forgotMailer: tools.forgotMailer
  });

  // launch crud api
  crud.configure({ cors: nconf.get('cors') });
  crud.launch(app);

  // all other routes
  app.get('/api/*', function(req, res) {
    res.status(404).json({ error: 'Route not found' });
  });

  // connect to db
  if (!url) return console.warn('No MONGO_URL. Not attaching to db.');

  mongoose.connect(url);
  mongoose.connection.on('error', function(e) {
    console.error('Mongoose default connection error: ' + e);
  });
  mongoose.connection.once('connected', function() {
    console.log('connected to db.');
  });
}
