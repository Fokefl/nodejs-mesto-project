import mongoose from 'mongoose';
import { AppError, AppErrorType } from '../types/errors';
import { HTTP_STATUS } from './constants';
import { HttpStatusCode } from '../types/http-status';

export const isMongoServerError = (error: unknown): error is mongoose.mongo.MongoServerError => error instanceof Error && error.name === 'MongoServerError' && 'code' in error;

export const createAppError = (type: AppErrorType, message: string): AppError => {
  const errorTypes: Record<AppErrorType, { statusCode: HttpStatusCode; name: string }> = {
    notFound: { statusCode: HTTP_STATUS.NotFound, name: 'NotFoundError' },
    validation: { statusCode: HTTP_STATUS.BadRequest, name: 'ValidationError' },
    unauthorized: { statusCode: HTTP_STATUS.Unauthorized, name: 'UnauthorizedError' },
    duplicate: { statusCode: HTTP_STATUS.Conflict, name: 'DuplicateError' },
    server: { statusCode: HTTP_STATUS.InternalServerError, name: 'ServerError' },
    initialization: { statusCode: HTTP_STATUS.InternalServerError, name: 'InitializationError' },
    forbidden: { statusCode: HTTP_STATUS.Forbidden, name: 'ForbiddenError' },
  };

  const errorConfig = errorTypes[type];

  const error = new Error(message) as AppError;
  error.statusCode = errorConfig.statusCode;
  error.name = errorConfig.name;

  return error;
};

// Специализированные функции для создания ошибок
export const createNotFoundError = (message: string) => createAppError('notFound', message);
export const createValidationError = (message: string) => createAppError('validation', message);
export const createDuplicateError = (message: string) => createAppError('duplicate', message);
export const createUnauthorizedError = (message: string) => createAppError('unauthorized', message);
export const createServerError = (message: string) => createAppError('server', message);
export const createInitializationError = (message: string) => createAppError('initialization', message);
export const createForbiddenError = (message: string) => createAppError('forbidden', message);
