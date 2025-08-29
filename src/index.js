import dotenv from 'dotenv';
import connectDatabase from './database/index.js';

dotenv.config({
  debug: true
})

connectDatabase();