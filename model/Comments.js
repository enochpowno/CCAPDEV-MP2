import Mongoose from 'mongoose';
import MongoosePaginate from 'mongoose-paginate-v2';

const CommentSchema = new Mongoose.Schema({
  user: {
    type: Mongoose.SchemaTypes.ObjectId,
    ref: 'Users',
  },

  review: {
    type: Mongoose.SchemaTypes.ObjectId,
    ref: 'Reviews',
  },

  content: {
    type: String,
    required: [true, 'A comment is required.'],
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

  replyTo: {
    type: Mongoose.SchemaTypes.ObjectId,
    ref: 'Comments',
  },

  replies: [
    { type: Mongoose.SchemaTypes.ObjectId, ref: 'Comments' },
  ],

  date: {
    type: Date,
    default: Date.now,
  },
});

CommentSchema.plugin(MongoosePaginate);

export default Mongoose.model('Comments', CommentSchema, 'comments');
