import { INCORRECT_URL_ERROR, URL_REGEX } from './constants';
import { createValidationError } from './errors';

export const urlValidator = (url: string): boolean => URL_REGEX.test(url);

export const urlJoiValidator = (value: string) => {
  if (!urlValidator(value)) {
    throw createValidationError(INCORRECT_URL_ERROR);
  }
  return value;
};
