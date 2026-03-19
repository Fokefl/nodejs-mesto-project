import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User, { IUserPublic } from '../models/user';
import {
  createDuplicateError,
  createNotFoundError,
  createValidationError,
  isMongoServerError,
} from '../utils/errors';
import {
  DUPLICATE_USER_ERROR,
  INCORRECT_DATA_ERROR,
  NOT_FOUND_USER_DATA_ERROR,
  VALIDATION_USER_AVATAR_DATA_ERROR,
  VALIDATION_USER_DATA_ERROR,
  VALIDATION_USER_PROFILE_DATA_ERROR,
  HTTP_STATUS, DEV_JWT_SECRET,
} from '../utils/constants';

require('dotenv').config();

const { JWT_SECRET = DEV_JWT_SECRET } = process.env;

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findUserByCredentials(email, password);
    const token = jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res
      .cookie(
        'jwt',
        token,
        {
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
          sameSite: true,
        },
      )
      .json({
        _id: user._id,
        email: user.email,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
      });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await User
      .find({})
      .select('name about avatar email _id')
      .lean();

    res.json({ users });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('name about avatar email _id')
      .lean()
      .orFail(createNotFoundError(NOT_FOUND_USER_DATA_ERROR));

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findOne({ _id: req.user._id })
      .select('name about avatar email _id')
      .lean()
      .orFail(createNotFoundError(NOT_FOUND_USER_DATA_ERROR));

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name, about, avatar, email, password,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, about, avatar, email, password: hashedPassword,
    });

    res.status(HTTP_STATUS.Created).json({
      _id: user._id,
      email: user.email,
      name: user.name,
      about: user.about,
      avatar: user.avatar,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      next(createValidationError(VALIDATION_USER_DATA_ERROR));
    } else if (error instanceof mongoose.Error.CastError) {
      next(createValidationError(INCORRECT_DATA_ERROR));
    } else if (isMongoServerError(error) && error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];
      next(createDuplicateError(`${DUPLICATE_USER_ERROR} ${field}`));
    }
    next(error);
  }
};

export const updateUser = async (
  req: Request,
  res: Response<unknown,
    IUserPublic>,
  next: NextFunction,
) => {
  try {
    const { name, about } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      {
        new: true,
        runValidators: true,
      },
    )
      .select('name about avatar email _id')
      .lean()
      .orFail(createNotFoundError(NOT_FOUND_USER_DATA_ERROR));

    res.json({ user });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      next(createValidationError(VALIDATION_USER_PROFILE_DATA_ERROR));
    } else if (error instanceof mongoose.Error.CastError) {
      next(createValidationError(INCORRECT_DATA_ERROR));
    }
    next(error);
  }
};

export const updateAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      {
        new: true,
        runValidators: true,
      },
    )
      .select('name about avatar email _id')
      .lean()
      .orFail(createNotFoundError(NOT_FOUND_USER_DATA_ERROR));

    res.json({ user });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      next(createValidationError(VALIDATION_USER_AVATAR_DATA_ERROR));
    } else if (error instanceof mongoose.Error.CastError) {
      next(createValidationError(INCORRECT_DATA_ERROR));
    }
    next(error);
  }
};
