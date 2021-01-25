import { model, Schema, SchemaTypes } from 'mongoose';

export default model('Reviews', new Schema({
  user: {
    type: SchemaTypes.ObjectId,
    ref: 'Users',
  },

  movie: {
    type: SchemaTypes.ObjectId,
    ref: 'Movies',
  },

  title: {
    type: String,
    required: [true, 'The review title is required'],
  },

  content: {
    type: String,
    required: [true, 'The review content is required'],
  },

  comments: [
    { type: SchemaTypes.ObjectId, ref: 'Comments' },
  ],

  date: {
    type: Date,
    default: Date.now,
  },
}));
