import dotenv from 'dotenv';
dotenv.config();

export const config = {
  db: {
    host: process.env.DB_HOST,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASSWORD,
  },
};

export default config;
