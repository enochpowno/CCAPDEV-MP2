import { model, Schema, SchemaTypes } from 'mongoose';

export default model('Users', new Schema({
  name: {
    type: String,
    required: [true, 'Your full name is required.'],
  },

  username: {
    type: String,
    required: [true, 'Your username is required.'],
  },

  password: {
    type: String,
    required: [true, 'Your password is requried.'],
  },

  email: {
    type: String,
    required: [true, 'Your email is required.'],
    validate: {
      validator: (v) => /^\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/.test(v),
      message: (props) => `${props.value} is not a valid email address.`,
    },
  },

  photo: {
    type: Buffer,
    required: [true, 'You profile photo is required'],
  },

  reviews: [
    { type: SchemaTypes.ObjectId, ref: 'Reviews'},
  ],

  admin: {
    type: Boolean,
    default: false,
  },
}));
