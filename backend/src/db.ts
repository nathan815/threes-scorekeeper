import mongoose from 'mongoose';
import config from './config';

export const MONGO_URL =  `mongodb://${config.db.host}/${config.db.name}`;

export const MONGO_OPTIONS = {
  user: config.db.user,
  pass: config.db.pass,
  authSource: 'admin',
};

export function configureDb(): Promise<typeof mongoose> {
  console.log(`Connecting to mongodb: ${MONGO_URL}`);
  return mongoose.connect(MONGO_URL, MONGO_OPTIONS);
}
