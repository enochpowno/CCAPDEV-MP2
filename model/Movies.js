import { model, Schema, SchemaTypes } from 'mongoose';

export default model('Movies', new Schema({
  title: {
    type: String,
    required: [true, 'The movie title is required'],
  },

  poster: {
    type: Buffer,
    required: [true, 'The movie poster is required'],
  },

  synopsis: {
    type: String,
    required: [true, 'The movie synopsis is required'],
  },

  upvote: {
    type: Number,
    default: 0,
    min: [0, 'Upvotes must be a positive number.'],
  },

  downvote: {
    type: Number,
    default: 0,
    min: [0, 'Downvotes must be a positive number.'],
  },

  price: {
    type: Number,
    required: [true, 'The movie price is required'],
    min: [0.0, 'The price must be a positive number.'],
  },

  status: {
    type: String,
    required: [true, 'The status is required'],
  },

  reviews: [
    { type: SchemaTypes.ObjectId, ref: 'Reviews' },
  ],

  date: {
    type: Date,
    default: Date.now,
  },
}));
