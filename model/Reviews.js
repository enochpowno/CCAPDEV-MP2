const Mongoose = require('mongoose');

module.exports = new Mongoose.Schema({
  user: {
    type: Mongoose.SchemaTypes.ObjectId,
    ref: 'Users',
  },

  movie: {
    type: Mongoose.SchemaTypes.ObjectId,
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
    { type: Mongoose.SchemaTypes.ObjectId, ref: 'Comments' },
  ],

  date: {
    type: Date,
    default: Date.now,
  },
});
