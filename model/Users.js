import Mongoose from 'mongoose';
import MongoosePaginate from 'mongoose-paginate-v2';

const UserSchema = new Mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Your full name is required.'],
  },

  username: {
    type: String,
    required: [true, 'Your username is required.'],
  },

  description: {
    type: String,
    required: [true, 'Your description is required.'],
  },

  password: {
    type: String,
    required: [true, 'Your password is requried.'],
    minlength: [8, 'Your password must be at least 8 characters long.'],
  },

  email: {
    type: String,
    required: [true, 'Your email is required.'],
    validate: {
      validator: (v) => /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(v),
      message: (props) => `${props.value} is not a valid email address.`,
    },
  },

  photo: {
    type: Buffer,
    required: [true, 'You profile photo is required'],
  },

  reviews: [
    { type: Mongoose.SchemaTypes.ObjectId, ref: 'Reviews' },
  ],

  admin: {
    type: Boolean,
    default: false,
  },

  create_date: {
    type: Date,
    default: Date.now,
  },
});

UserSchema.plugin(MongoosePaginate);

export default Mongoose.model('Users', UserSchema, 'users');
