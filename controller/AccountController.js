import { Users } from '../model';
import { createHash } from "crypto";

const sha256 = createHash('sha256')
export default class AccountController {
  hash(s) {
    return sha256.update(s).digest('hex')
  }
  
  async get (filter, populate) {
    const ret = {
      success: false,
      result: null,
      message: '',
      errors: [],
    }
    
    try {
      if (populate) {
        ret.result = await Users
        .findOne(filter)
        .populate('reviews')
        .lean()
        .exec()
      } else {
        ret.result = await Users
        .findOne(filter)
        .lean()
        .exec()
      }
      
      ret.success = true
    } catch (err) {
      ret.errors.push('Oops! Something went wrong while trying to find your account.')
    }
    
    return ret;
  }
  
  async findReviews (username) {
    return await this.get({username}, true).reviews
  }
  
  async register ({name, username, password, email, photo}) {
    const ret = {
      success: false,
      result: null,
      message: '',
      errors: []
    }
    
    const user = await this.get({username}, false)
    
    if (user) {
      ret.errors.push('Oops! Looks like that username is already taken.')
    } else {
      const account = new Users({
        name,
        username,
        email,
        photo,
        password: hash(password)
      })
      
      try {
        ret.result = await account.save()
        ret.success = true
      } catch (e) {
        Object.keys(e.errors).forEach(error => {
          ret.errors.push(error.message)
        });
      }
    }

    return ret
  }
  
  async login ({username, password}) {
    const ret = {
      success: false,
      result: null,
      message: '',
      errors: []
    }
    
    const account = await get({username: username, password: hash(password)})
    
    if (account) {
      ret.success = true
      ret.result = account
    } else {
      ret.errors.push(`Oops! We can't find any account with that username.`)
    }
    
    return ret
  }
}
