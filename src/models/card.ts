import mongoose from 'mongoose';
import { urlValidator } from '../utils/validators';

export interface ICard {
  name: string;
  link: string;
  owner: mongoose.Schema.Types.ObjectId;
  likes: mongoose.Schema.Types.ObjectId[];
  createdAt: Date;
}

const cardSchema = new mongoose.Schema<ICard>({
  name: {
    type: String,
    required: [true, 'name не может быть пустым'],
    minlength: 2,
    maxlength: 30,
  },
  link: {
    type: String,
    required: [true, 'link не может быть пустым'],
    validate: {
      validator: urlValidator,
      message: 'Неправильный формат ссылки на изображение',
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: [true, 'owner не может быть пустым'],
  },
  likes:
    {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
      }],
      default: [],
    },

}, {
  timestamps: true,
  versionKey: false,
});

export default mongoose.model<ICard>('card', cardSchema);
