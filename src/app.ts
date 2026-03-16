import express, { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { errors } from 'celebrate';
import serverError from './middlewares/errors';
import router from './routes';
import { createInitializationError } from './utils/errors';
import { AppError } from './types/errors';
import { logger, errorLogger } from './middlewares/logger';
import { MONGO_DB_MESTO_URL } from './utils/constants';

require('dotenv').config();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // за 15 минут
  limit: 100, // можно совершить максимум 100 запросов с одного IP
});

const { PORT = 3000, NODE_ENV, BASE_URL } = process.env;
const app = express();
app.use(limiter);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

async function start() {
  try {
    const mongoUrl = NODE_ENV === 'production' && BASE_URL ? BASE_URL : MONGO_DB_MESTO_URL;
    await mongoose.connect(mongoUrl);
    app.listen(+PORT);
  } catch (error) {
    throw createInitializationError(`Ошибка при инициализации приложения: ${error}`);
  }
}
app.use(logger);
app.use('/', router);

app.use(errorLogger);
app.use(errors());
app.use((
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => serverError(err, req, res, next));

start();
