import dotenv from 'dotenv';
dotenv.config();

function env(key: string, required = true): string {
  const val = process.env[key];
  if (!process.env.hasOwnProperty(key) || val === undefined) {
    throw new Error('Required environment variable is not defined');
  }
  return val;
}

export const config = {
  environment: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === 'production',
  app: {
    port: process.env.PORT || 8080,
  },
  db: {
    host: env('DB_HOST'),
    name: env('DB_NAME'),
    user: env('DB_USER'),
    pass: env('DB_PASSWORD'),
  },
  oauth: {
    google: {
      clientId: env('GOOGLE_OAUTH_CLIENT_ID'),
      secret: env('GOOGLE_OAUTH_SECRET'),
    },
  },
};

export default config;
