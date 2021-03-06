/* eslint-disable prefer-arrow-callback */
import Mongoose from 'mongoose';
import MongoosePaginate from 'mongoose-paginate-v2';
import Comments from './Comments';
import Users from './Users';
import Movies from './Movies';

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

  upvoters: [
    { type: Mongoose.SchemaTypes.ObjectId, ref: 'Users' },
  ],

  downvoters: [
    { type: Mongoose.SchemaTypes.ObjectId, ref: 'Users' },
  ],

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
ReviewSchema.pre('deleteMany', { document: false, query: true }, async function (next) {
  const docs = await this.model.find(this.getFilter(), '_id comments user');
  const promises = [];

  docs.forEach((doc) => {
    if (doc.comments.length > 0) {
      promises.push(new Promise((resolve, reject) => {
        Comments.deleteMany({ _id: { $in: doc.comments } }).then((results) => {
          resolve(results);
        });
      }));
    }

    promises.push(new Promise((resolve, reject) => {
      Users.updateOne({ _id: doc.user }, { $pull: { reviews: doc._id } }).then((results) => {
        resolve(results);
      });
    }));
  });

  await Promise.all(promises)
    .then(() => {
      next();
    });
});

ReviewSchema.post('save', async function (doc, next) {
  const promises = [];

  promises.push(new Promise((resolve, reject) => {
    Movies.updateOne({
      _id: doc.movie,
    }, {
      $push: {
        reviews: doc._id,
      },
    }).then((result) => {
      resolve(result);
    });
  }));

  promises.push(new Promise((resolve, reject) => {
    Users.updateOne({
      _id: doc.user,
    }, {
      $push: {
        reviews: doc._id,
      },
    }).then((result) => {
      resolve(result);
    });
  }));

  await Promise.all(promises).then((result) => {
    next();
  });
});

export default Mongoose.model('Reviews', ReviewSchema, 'reviews');
