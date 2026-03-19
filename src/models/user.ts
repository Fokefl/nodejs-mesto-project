import mongoose, { Error } from 'mongoose';
import isEmail from 'validator/lib/isEmail';
import bcrypt from 'bcryptjs';
import { createServerError, createUnauthorizedError } from '../utils/errors';
import { INCORRECT_AUTH_DATA_ERROR, SERVER_ERROR } from '../utils/constants';
import { urlValidator } from '../utils/validators';

export interface IUser {
  name: string;
  about: string;
  avatar: string;
  email: string;
  password: string;
}

export interface IUserPublic {
  _id: mongoose.Types.ObjectId;
  name: string;
  about: string;
  avatar: string;
  email: string;
}

interface UserModel extends mongoose.Model<IUser> {
  findUserByCredentials: (
    email: string,
    password: string
  ) => Promise<IUserPublic>
}

const userSchema = new mongoose.Schema<IUser, UserModel>({
  name: {
    type: String,
    default: 'Жак-Ив Кусто',
    minlength: 2,
    maxlength: 30,
  },
  about: {
    type: String,
    default: 'Исследователь',
    minlength: 2,
    maxlength: 200,
  },
  avatar: {
    type: String,
    default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
    validate: {
      validator: urlValidator,
      message: 'Неправильный формат ссылки на аватар',
    },
  },
  email: {
    type: String,
    required: [true, 'email не может быть пустым'],
    unique: true,
    validate: [isEmail, 'Неправильный формат почты'],
  },
  password: {
    type: String,
    required: [true, 'password не может быть пустым'],
    minlength: 8,
    select: false,
  },
}, { versionKey: false });

userSchema.static('findUserByCredentials', async function findUserByCredentials(
  email: string,
  password: string,
) {
  const user = await this.findOne({ email }).select('+password').lean();
  
  if (!user) {
    throw createUnauthorizedError(INCORRECT_AUTH_DATA_ERROR);
  }

  const matched = await bcrypt.compare(password, user.password);
  
  if (!matched) {
    throw createUnauthorizedError(INCORRECT_AUTH_DATA_ERROR);
  }

  return user;
});

export default mongoose.model<IUser, UserModel>('user', userSchema);