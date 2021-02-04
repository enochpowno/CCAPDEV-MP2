import { Movies } from '../model';

export default class MovieController {
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
        ret.results = await Movies
          .find(filter, projection, options)
          .populate(populate)
          .lean(lean)
          .exec();
      } else {
        ret.results = await Movies
          .find(filter, projection, options)
          .lean(lean)
          .exec();
      }

      ret.success = true;
    } catch (err) {
      ret.errors.push('Oops! Something went wrong while trying to find your movies.');
    }

    return ret;
  }

  async paginate({ filter, options = {} }) {
    try {
      const result = await Movies.paginate(filter, options);

      if (result) {
        return {
          success: true,
          message: 'You successfully retrieved some movies!',
          errors: [],
          results: result,
        };
      }
    } catch (e) {}

    return {
      success: false,
      message: '',
      errors: ['Something went wrong while trying to retrieve movies!'],
      results: [],
    };
  }

  async update({ filter, updates, options = {} }) {
    try {
      updates.date = Date.now();
      const result = await Movies.updateMany(filter, updates, options);

      if (result.ok) {
        return {
          success: true,
          message: 'You successfully updated that movie!',
          errors: [],
          results: [result],
          updates,
        };
      }
    } catch (e) {}

    return {
      success: false,
      message: '',
      errors: ['Something went wrong while trying to update that movie!'],
      results: null,
      updates: null,
    };
  }

  async create({
    title, poster, synopsis, price, status,
  }) {
    const ret = {
      success: false,
      results: null,
      message: '',
      errors: [],
    };

    const movie = new Movies({
      title,
      poster,
      synopsis,
      price,
      status,
    });

    try {
      ret.result = await movie.save();
      ret.success = true;
      ret.message = `You've succesfully created the movie: ${title}`;
    } catch (e) {
      Object.keys(e.errors).forEach((error) => {
        ret.errors.push(error.message);
      });
    }

    return ret;
  }

  async delete({ filter, options = {} }) {
    try {
      const result = await Movies
        .deleteMany(filter, options)
        .exec();

      if (result.ok) {
        return {
          success: true,
          message: 'You successfully deleted that movie!',
          errors: [],
          results: [result],
        };
      }
    } catch (e) {}

    return {
      success: false,
      message: '',
      errors: ['Something went wrong while trying to delete that movie!'],
      results: null,
    };
  }
}
