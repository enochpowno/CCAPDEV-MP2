import Mongoose from 'mongoose';
import MongoosePaginate from 'mongoose-paginate-v2';

const MovieSchema = new Mongoose.Schema({
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

  upvoters: [
    { type: Mongoose.SchemaTypes.ObjectId, ref: 'Users' },
  ],

  downvoters: [
    { type: Mongoose.SchemaTypes.ObjectId, ref: 'Users' },
  ],

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
    { type: Mongoose.SchemaTypes.ObjectId, ref: 'Reviews' },
  ],

  date: {
    type: Date,
    default: Date.now,
  },
});

MovieSchema.plugin(MongoosePaginate);

export default Mongoose.model('movie', MovieSchema, 'movies');
