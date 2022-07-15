import mongoose from 'mongoose';
import config from './config.js';

console.log('Connecting to mongo', config.db);
mongoose.connect(`mongodb://${config.db.host}/${config.db.name}`, {
  user: config.db.user,
  pass: config.db.pass,
  authSource: 'admin',
});
