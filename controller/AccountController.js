import { Users } from '../model';
import { createHash } from "crypto";

const sha256 = createHash('sha256')
export default class AccountController {
  hash(s) {
    return sha256.update(s).digest('hex');
  }
  
  async get ({ filter, projection = {}, options = {}, populate = false, lean = true }) {
    const ret = {
      success: false,
      results: null,
      message: '',
      errors: [],
    };
    
    try {
      if (populate) {
        ret.results = await Users
        .find(filter, projection, options)
        .populate('reviews')
        .lean(lean)
        .exec();
      } else {
        ret.results = await Users
        .find(filter, projection, options)
        .lean(lean)
        .exec();
      }
      
      ret.success = true;
    } catch (err) {
      ret.errors.push('Oops! Something went wrong while trying to find your account.');
    }
    
    return ret;
  }

  async create ({ name, username, password, email, photo }) {
    const ret = {
      success: false,
      results: null,
      message: '',
      errors: []
    };
    
    const user = await this.get({filter: {username}}, false);
    
    if (user.results) {
      if (user.results) {
        const account = new Users({
          name,
          username,
          email,
          photo,
          password: hash(password)
        });
        
        try {
          ret.result = await account.save();
          ret.success = true;
        } catch (e) {
          Object.keys(e.errors).forEach(error => {
            ret.errors.push(error.message);
          });
        }
      } else {
        ret.errors.push('Oops! Looks like that username is already taken.');
      }
    } else {
      ret.errors.push(...user.errors); 
    }

    return ret;
  }
  
  async login ({ username, password }) {
    const ret = {
      success: false,
      results: null,
      message: '',
      errors: []
    };
    
    const account = await get({filter: {username: username, password: hash(password)}});
    
    if (account.success) {
      if (account.result) {
        ret.success = true;
        ret.results = account.results[0];
      } else {
        ret.errors.push(`Oops! We can't find any account with that username.`);
      }
    } else {
      ret.errors.push(...account.errors);
    }
    
    return ret;
  }

  async delete ({ filter, options = {} }) {
    try {
      const result = await Users
            .deleteMany(filter, options)
            .exec();

      if (result.ok) {
        return {
          success: true,
          message: 'You successfully deleted that user!',
          errors: [],
          results: [result]
        }
      }
    } catch (e) {}

    return {
      success: false,
      message: '',
      errors: ['Something went wrong while trying to delete that user!'],
      results: [result]
    }
  }
  
}
