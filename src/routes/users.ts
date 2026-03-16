import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import {
  getUserById,
  getUserProfile,
  getUsers,
  updateAvatar,
  updateUser,
} from '../controllers/users';
import { urlJoiValidator } from '../utils/validators';

const router = Router();

router.get('/', getUsers);

router.get('/me', getUserProfile);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex(),
  }),
}), getUserById);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(200),
  }),
}), updateUser);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().custom(urlJoiValidator),
  }),
}), updateAvatar);

export default router;
