import { model, Schema, SchemaTypes } from 'mongoose';
import { default as MongoosePaginate } from "mongoose-paginate-v2";

const ReviewSchema = new Schema({
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
});

ReviewSchema.plugin(MongoosePaginate);

export default model('Reviews', ReviewSchema);
