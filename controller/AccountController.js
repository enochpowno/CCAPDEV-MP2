import { Users } from '../model';
import { createHash } from "crypto";

const sha256 = createHash('sha256')
export default class AccountController {
  hash(s) {
    return sha256.update(s).digest('hex')
  }
  
  async get ({filter, projection = {}, options = {}, populate = false}) {
    const ret = {
      success: false,
      result: null,
      message: '',
      errors: [],
    }
    
    try {
      if (populate) {
        ret.result = await Users
        .find(filter, projection, options)
        .populate('reviews')
        .lean()
        .exec()
      } else {
        ret.result = await Users
        .find(filter, projection, options)
        .lean()
        .exec()
      }
      
      ret.success = true
    } catch (err) {
      ret.errors.push('Oops! Something went wrong while trying to find your account.')
    }
    
    return ret;
  }
  
  async register ({name, username, password, email, photo}) {
    const ret = {
      success: false,
      result: null,
      message: '',
      errors: []
    };
    
    const user = await this.get({filter: {username}}, false);
    
    if (user.result) {
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

    return ret;
  }
  
  async login ({username, password}) {
    const ret = {
      success: false,
      result: null,
      message: '',
      errors: []
    };
    
    const account = await get({filter: {username: username, password: hash(password)}});
    
    if (account.result) {
      ret.success = true;
      ret.result = account.result;
    } else {
      ret.errors.push(`Oops! We can't find any account with that username.`);
    }
    
    return ret;
  }
}
