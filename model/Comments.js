const Mongoose = require('mongoose');

module.exports = new Mongoose.Schema({
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

  replies: [
    { type: Mongoose.SchemaTypes.ObjectId, ref: 'Comments' },
  ],

  date: {
    type: Date,
    default: Date.now,
  },
});
