import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import Card from '../models/card';
import {
  createDuplicateError,
  createForbiddenError,
  createNotFoundError,
  createValidationError,
  isMongoServerError,
} from '../utils/errors';
import {
  DUPLICATE_CARD_ERROR,
  INCORRECT_DATA_ERROR,
  INCORRECT_LIKE_DATA_ERROR,
  NOT_FOUND_CARD_DATA_ERROR,
  VALIDATION_CARD_DATA_ERROR,
  HTTP_STATUS, COPYRIGHT_ERROR,
} from '../utils/constants';

export const getCards = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cards = await Card
      .find({})
      .populate({
        path: 'owner',
        options: {
          projection: { _id: 1 },
        },
      })
      .sort({ createdAt: -1 })
      .lean();

    res.json({ cards });
  } catch (error) {
    next(error);
  }
};

export const createCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, link } = req.body;
    const owner = req.user._id;
    const card = await Card.create({ name, link, owner });

    res.status(HTTP_STATUS.Created).json({ card });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      next(createValidationError(VALIDATION_CARD_DATA_ERROR));
    } else if (error instanceof mongoose.Error.CastError) {
      next(createValidationError(INCORRECT_DATA_ERROR));
    } else if (isMongoServerError(error) && error.code === 11000) {
      const field = Object.keys(error.keyValue || {})[0];
      next(createDuplicateError(`${DUPLICATE_CARD_ERROR} ${field}`));
    }
    next(error);
  }
};

export const removeCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id } = req.user;

    const card = await Card.findById(req.params.cardId)
      .select('name link owner likes _id createdAt updatedAt')
      .lean()
      .orFail(createNotFoundError(NOT_FOUND_CARD_DATA_ERROR));
    if (_id !== card.owner) {
      next(createForbiddenError(COPYRIGHT_ERROR));
    }
    await Card.deleteOne({ _id: card._id });

    res.json({ card });
  } catch (error) {
    next(error);
  }
};

export const likeCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true },
    )
      .select('name link owner likes _id createdAt updatedAt')
      .lean()
      .orFail(createNotFoundError(NOT_FOUND_CARD_DATA_ERROR));

    res.json({ card });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      next(createValidationError(INCORRECT_LIKE_DATA_ERROR));
    } else if (error instanceof mongoose.Error.CastError) {
      next(createValidationError(INCORRECT_DATA_ERROR));
    }
    next(error);
  }
};

export const dislikeCard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const card = await Card.findByIdAndUpdate(
      req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true },
    )
      .select('name link owner likes _id createdAt updatedAt')
      .lean()
      .orFail(createNotFoundError(NOT_FOUND_CARD_DATA_ERROR));

    res.json({ card });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      next(createValidationError(INCORRECT_LIKE_DATA_ERROR));
    } else if (error instanceof mongoose.Error.CastError) {
      next(createValidationError(INCORRECT_DATA_ERROR));
    }
    next(error);
  }
};
