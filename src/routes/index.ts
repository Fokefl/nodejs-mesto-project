import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import usersRouter from './users';
import cardsRouter from './cards';
import { createUser, login } from '../controllers/users';
import auth from '../middlewares/auth';
import { urlJoiValidator } from '../utils/validators';
import { createNotFoundError } from '../utils/errors';
import { NOT_FOUND_PAGE_ERROR } from '../utils/constants';

const router = Router();

router.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

router.post('/signup', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().min(2).max(30),
    avatar: Joi.string().custom(urlJoiValidator),
    about: Joi.string().min(2).max(200),
  }).unknown(true),
}), createUser);

router.use('/users', auth, usersRouter);

router.use('/cards', auth, cardsRouter);

router.use((req, res, next) => {
  next(createNotFoundError(NOT_FOUND_PAGE_ERROR));
});

export default router;
