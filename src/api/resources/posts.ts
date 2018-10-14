// ========================================================================== //
//                              POST RESOURCE                                 //
// ========================================================================== //

// Load Modules ----------------------------------------------------------------

import * as crud from 'node-crud';
import * as cm from 'crud-mongoose';
import * as mongoose from 'mongoose';
import * as turnkey from 'turnkey';
import * as tools from '../tools';

const debug = require('debug')('api:posts'),
      ObjectId = mongoose.Schema.Types.ObjectId,
      Mixed = mongoose.Schema.Types.Mixed;

// tslint:disable
let Schema, Model;
// tslint:enable

// Create a Schema & Model -----------------------------------------------------

Schema = exports.Schema = new mongoose.Schema({
  text: { type: String },
  user: { type: ObjectId },
  dates: {
    created: { type: Date, default: Date.now },
    updated: { type: Date, default: Date.now }
  }
});

Model = exports.Model = mongoose.model('posts', Schema);

// All posts -------------------------------------------------------------------

crud.entity('/posts').Read()
  .use(turnkey.loggedIn())
  .pipe(tools.mw.queryUser())
  .pipe(cm.findAll(Model));

crud.entity('/posts').Create()
  .use(turnkey.loggedIn())
  .pipe(tools.mw.dataUser())
  .pipe(cm.parseData().removes('dates'))
  .pipe(cm.createNew(Model));

/* Uncommon crud route to delete all
crud.entity('/posts').Delete()
  .use(turnkey.loggedIn({ role: 'admin' }))
  .pipe(tools.mw.queryUser(true))
  .pipe(cm.removeAll(Model));
*/

crud.entity('/posts').on('error', function(method, e) {
  debug('%s error: %j', method, e);
});

// One post --------------------------------------------------------------------

crud.entity('/posts/:_id').Read()
  .use(turnkey.loggedIn())
  .pipe(tools.mw.queryUser())
  .pipe(cm.findOne(Model));

crud.entity('/posts/:_id').Update()
  .use(turnkey.loggedIn())
  .pipe(tools.mw.queryUser())
  .pipe(cm.parseData()
          .removes('dates.created', 'user')
          .overrides({ 'dates.updated': Date.now }))
  .pipe(cm.updateOne(Model));

crud.entity('/posts/:_id').Delete()
  .use(turnkey.loggedIn())
  .pipe(tools.mw.queryUser())
  .pipe(cm.removeOne(Model));

crud.entity('/posts/:_id').on('error', function(method, e) {
  debug('one | %s error: %j', method, e);
});
