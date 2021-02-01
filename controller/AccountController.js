import { createHash } from 'crypto';
import { Users } from '../model';

class AccountController {
  hash(s) {
    return createHash('sha256').update(s).digest('hex');
  }

  async get({
    filter, projection = {}, options = {}, populate = false, lean = true,
  }) {
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
          .populate(populate)
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

  async create({
    name, username, password, email, photo, description,
  }) {
    const ret = {
      success: false,
      results: null,
      message: '',
      errors: [],
    };

    const user = await this.get({ filter: { $or: [{ username }, { email }] } }, false);

    if (user.errors.length === 0) {
      if (user.results.length === 0) {
        const account = new Users({
          name,
          username,
          email,
          photo,
          password: this.hash(password),
          description,
        });

        try {
          if (password && password.length < 8) {
            ret.errors.push('Your password must be at least 8 characters long.');
          } else {
            ret.result = await account.save();
            ret.message = "You've succefully created your account! You can now login.";
            ret.success = true;
          }
        } catch (e) {
          Object.keys(e.errors).forEach((error) => {
            ret.errors.push(e.errors[error].message);
          });
        }
      } else {
        ret.errors.push('Oops! Looks like that username or email is already taken.');
      }
    } else {
      ret.errors.push(...user.errors);
    }

    return ret;
  }

  async login({ username, password }) {
    const ret = {
      success: false,
      results: null,
      message: '',
      errors: [],
    };

    const account = await this.get({ filter: { username, password: this.hash(password) } });

    if (account.success) {
      if (account.results && account.results.length > 0) {
        ret.success = true;
        ret.results = [account.results[0]];
        ret.message = 'You\'ve succesfully logged in, please wait while you are being redirected...';
      } else {
        ret.errors.push('Oops! We can\'t find any account with that username and password.');
      }
    } else {
      ret.errors.push(...account.errors);
    }

    return ret;
  }

  async update({ filter, updates, options = {} }) {
    try {
      const result = await Users.updateMany(filter, updates, options);

      if (result.ok) {
        return {
          success: true,
          message: 'You successfully updated your details!',
          errors: [],
          results: [result],
          updates,
        };
      }
    } catch (e) {}

    return {
      success: false,
      message: '',
      errors: ['Something went wrong while trying to update your details!'],
      results: null,
      updates: null,
    };
  }

  async delete({ filter, options = {} }) {
    try {
      const result = await Users
        .deleteMany(filter, options)
        .exec();

      if (result.ok) {
        return {
          success: true,
          message: 'You successfully deleted that user!',
          errors: [],
          results: [result],
        };
      }
    } catch (e) {}

    return {
      success: false,
      message: '',
      errors: ['Something went wrong while trying to delete that user!'],
      results: null,
    };
  }
}

export default AccountController;
