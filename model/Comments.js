/* eslint-disable prefer-arrow-callback */
import Mongoose from 'mongoose';
import MongoosePaginate from 'mongoose-paginate-v2';
import Reviews from './Reviews';

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
    required: [true, 'A comment content is required.'],
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
  const docs = await this.model.find(this.getFilter(), 'replies review replyTo');
  const promises = [];

  docs.forEach((doc) => {
    if (doc.replies) {
      promises.push(new Promise((resolve, reject) => {
        this.model.deleteMany({ _id: { $in: doc.replies } }).then((result) => {
          resolve(result);
        });
      }));
    }

    if (doc.review) {
      promises.push(new Promise((resolve, reject) => {
        Reviews.updateOne({
          _id: doc.review,
        }, {
          $pull: {
            comments: doc._id,
          },
        }).then((result) => {
          resolve(result);
        });
      }));
    } else if (doc.replyTo) {
      promises.push(new Promise((resolve, reject) => {
        this.model.updateOne({
          _id: doc.replyTo,
        }, {
          $pull: {
            replies: doc._id,
          },
        }).then((result) => {
          resolve(result);
        });
      }));
    }
  });

  await Promise.all(promises)
    .then(() => {
      next();
    });
});

CommentSchema.post('save', async function (doc, next) {
  const promises = [];

  if (!doc.replyTo) {
    promises.push(new Promise((resolve, reject) => {
      Reviews.updateOne({
        _id: doc.review,
      }, {
        $push: {
          comments: doc._id,
        },
      }).then((result) => resolve(result));
    }));
  } else {
    promises.push(new Promise((resolve, reject) => {
      doc.constructor.updateOne({
        _id: doc.replyTo,
      }, {
        $push: {
          replies: doc._id,
        },
      }).then((result) => resolve(result));
    }));
  }

  await Promise.all(promises).then((result) => {
    next();
  });
});

export default Mongoose.model('Comments', CommentSchema, 'comments');
