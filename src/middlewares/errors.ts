import { NextFunction, Request, Response } from 'express';
import { HTTP_STATUS, SERVER_ERROR } from '../utils/constants';
import { AppError } from '../types/errors';

const serverError = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  const { statusCode = HTTP_STATUS.InternalServerError, message } = err;
  res
    .status(statusCode)
    .send({
      message: statusCode === HTTP_STATUS.InternalServerError
        ? SERVER_ERROR
        : message,
    });
  next();
};

export default serverError;
