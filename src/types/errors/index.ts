import { HttpStatusCode } from '../http-status';

export interface AppError extends Error {
  statusCode?: HttpStatusCode;
  status?: number;
  message: string;
  name: string;
  stack?: string;
}
export type AppErrorType = 'notFound' | 'validation' | 'unauthorized' | 'duplicate' | 'server' | 'initialization' | 'forbidden';
