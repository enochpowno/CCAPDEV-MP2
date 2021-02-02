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

  upvoters: [
    { type: Mongoose.SchemaTypes.ObjectId, ref: 'Users' },
  ],

  downvoters: [
    { type: Mongoose.SchemaTypes.ObjectId, ref: 'Users' },
  ],

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
CommentSchema.pre('deleteMany', { document: false, query: true }, async function (next) {
  const docs = await this.model.find(this.getFilter(), 'replies');
  const promises = [];

  docs.forEach((doc) => {
    promises.push(new Promise((resolve, reject) => {
      this.model.deleteMany({ _id: { $in: doc.replies } }).then((result) => {
        resolve.result();
      });
    }));
  });

  await Promise.all(promises)
    .then(() => {
      next();
    });
});

export default Mongoose.model('Comments', CommentSchema, 'comments');
