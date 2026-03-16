import { HTTP_STATUS } from '../../utils/constants';

export type HttpStatusCode = typeof HTTP_STATUS[keyof typeof HTTP_STATUS];
