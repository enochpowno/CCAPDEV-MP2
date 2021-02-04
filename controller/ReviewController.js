import { Reviews } from '../model';

export default class ReviewController {
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
        ret.results = await Reviews
          .find(filter, projection, options)
          .populate(populate)
          .lean(lean)
          .exec();
      } else {
        ret.results = await Reviews
          .find(filter, projection, options)
          .lean(lean)
          .exec();
      }

      ret.success = true;
    } catch (err) {
      ret.errors.push('Oops! Something went wrong while trying to find your reviews.');
    }

    return ret;
  }

  async paginate({ filter, options = {} }) {
    try {
      const result = await Reviews.paginate(filter, options);

      if (result) {
        return {
          success: true,
          message: 'You successfully retrieved some reviews!',
          errors: [],
          results: result,
        };
      }
    } catch (e) {}

    return {
      success: false,
      message: '',
      errors: ['Something went wrong while trying to retrieve reviews!'],
      results: [],
    };
  }

  async update({ filter, updates, options = {} }) {
    try {
      updates.date = Date.now();
      const result = await Reviews.updateMany(filter, updates, options);

      if (result.ok) {
        return {
          success: true,
          message: 'You successfully updated that review!',
          errors: [],
          results: [result],
          updates,
        };
      }
    } catch (e) {}

    return {
      success: false,
      message: '',
      errors: ['Something went wrong while trying to update that review!'],
      results: null,
      updates,
    };
  }

  async create({
    title, content, movie, user,
  }) {
    const ret = {
      success: false,
      results: null,
      message: '',
      errors: [],
    };

    const review = new Reviews({
      title,
      content,
      movie,
      user,
    });

    try {
      ret.result = await review.save();
      ret.success = true;
      ret.message = "You've succesfully left a review on this movie.";
    } catch (e) {
      Object.keys(e.errors).forEach((error) => {
        ret.errors.push(error.message);
      });
    }

    return ret;
  }

  async delete({ filter, options = {} }) {
    try {
      const result = await Reviews
        .deleteMany(filter, options)
        .exec();

      if (result.ok) {
        return {
          success: true,
          message: 'You successfully deleted that review!',
          errors: [],
          results: [result],
        };
      }
    } catch (e) {}

    return {
      success: false,
      message: '',
      errors: ['Something went wrong while trying to delete that review!'],
      results: null,
    };
  }
}
