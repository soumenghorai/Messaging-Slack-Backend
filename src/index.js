import express from 'express';
import { StatusCodes } from 'http-status-codes';

import { PORT } from './config/serverConfig.js';
import connectDB from './config/dbConfig.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/ping', (req, res) => {
  return res.status(StatusCodes.OK).json({ message: 'Ping' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
