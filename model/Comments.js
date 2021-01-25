import { model, Schema, SchemaTypes } from 'mongoose';

export default model('Comments', new Schema({
  user: {
    type: SchemaTypes.ObjectId,
    ref: 'Users',
  },

  review: {
    type: SchemaTypes.ObjectId,
    ref: 'Reviews',
  },

  content: {
    type: String,
    required: [true, 'A comment is required.'],
  },

  replies: [
    { type: SchemaTypes.ObjectId, ref: 'Comments' },
  ],

  date: {
    type: Date,
    default: Date.now,
  },
}));
