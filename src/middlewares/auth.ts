import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { createUnauthorizedError } from '../utils/errors';
import { DEV_JWT_SECRET, INCORRECT_AUTH_DATA_ERROR } from '../utils/constants';

require('dotenv').config();

const { NODE_ENV = 'development', JWT_SECRET = DEV_JWT_SECRET } = process.env;

const auth = (req: Request, res: Response, next: NextFunction) => {
  let token;
  let payload;

  try {
    token = req.cookies.jwt;
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : DEV_JWT_SECRET);
  } catch (err) {
    next(createUnauthorizedError(INCORRECT_AUTH_DATA_ERROR));
  }

  req.user = payload as { _id: string };
  next();
};

export default auth;
