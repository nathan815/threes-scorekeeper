import mongoose from 'mongoose';
import CONFIG from './config';

export function configureDb(config = CONFIG): Promise<typeof mongoose> {
  const connString = `mongodb://${config.db.host}/${config.db.name}`;
  console.log(`Connecting to mongo @ ${connString}`);
  return mongoose.connect(connString, {
    user: config.db.user,
    pass: config.db.pass,
    authSource: 'admin',
  });
}
