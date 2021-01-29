import Mongoose from 'mongoose';
import MongoosePaginate from 'mongoose-paginate-v2';

const ReviewSchema = new Mongoose.Schema({
  user: {
    type: Mongoose.SchemaTypes.ObjectId,
    ref: 'Users',
  },

  movie: {
    type: Mongoose.SchemaTypes.ObjectId,
    ref: 'Movies',
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

  title: {
    type: String,
    required: [true, 'The review title is required'],
  },

  content: {
    type: String,
    required: [true, 'The review content is required'],
  },

  comments: [
    { type: Mongoose.SchemaTypes.ObjectId, ref: 'Comments' },
  ],

  date: {
    type: Date,
    default: Date.now,
  },
});

ReviewSchema.plugin(MongoosePaginate);

export default Mongoose.model('Reviews', ReviewSchema, 'reviews');
