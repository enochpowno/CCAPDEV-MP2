import Mongoose from 'mongoose';
import MongoosePaginate from 'mongoose-paginate-v2';
import Reviews from './Reviews';
import Users from './Users';

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
MovieSchema.pre('deleteMany', { document: false, query: true }, async function (next) {
  console.log('Deleting movie');
  const docs = await this.model.find(this.getFilter(), 'reviews');
  const promises = [];

  docs.forEach((doc) => {
    if (doc.reviews.length > 0) {
      promises.push(new Promise((resolve, reject) => {
        Reviews.deleteMany({ _id: { $in: doc.reviews } }).then((results) => {
          resolve(results);
        });
      }));

      promises.push(new Promise((resolve, reject) => {
        Users.updateMany({
          'watched._id': doc._id,
        }, {
          $pull: {
            watched: doc._id,
          },
        }).then((results) => {
          resolve(results);
        });
      }));
    }
  });

  await Promise.all(promises)
    .then((results) => {
      next();
    });
});

export default Mongoose.model('movie', MovieSchema, 'movies');
