import mongoose from 'mongoose';
import config from './config';

const connString = `mongodb://${config.db.host}/${config.db.name}`;
console.log(`Connecting to mongo @ ${connString}`);
mongoose.connect(connString, {
  user: config.db.user,
  pass: config.db.pass,
  authSource: 'admin',
});
