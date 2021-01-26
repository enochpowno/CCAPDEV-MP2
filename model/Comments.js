import { model, Schema, SchemaTypes } from 'mongoose';
import { default as MongoosePaginate } from "mongoose-paginate-v2";

const CommentSchema = new Schema({
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
});

CommentSchema.plugin(MongoosePaginate);

export default model('Comments', CommentSchema, 'comments');
