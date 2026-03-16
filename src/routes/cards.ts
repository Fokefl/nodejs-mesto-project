import { Router } from 'express';
import { celebrate, Joi } from 'celebrate';
import {
  getCards,
  createCard,
  removeCard,
  likeCard,
  dislikeCard,
} from '../controllers/cards';
import { urlJoiValidator } from '../utils/validators';

const router = Router();

const cardIdValidator = Joi.object().keys({
  cardId: Joi.string().length(24).hex(),
});

router.get('/', getCards);

router.post('/', celebrate({
  body: Joi.object().keys({
    link: Joi.string().required().custom(urlJoiValidator),
    name: Joi.string().min(2).max(30).required(),
  }),
}), createCard);

router.delete('/:cardId', celebrate({
  params: cardIdValidator,
}), removeCard);

router.put('/:cardId/likes', celebrate({
  params: cardIdValidator,
}), likeCard);

router.delete('/:cardId/likes', celebrate({
  params: cardIdValidator,
}), dislikeCard);

export default router;
