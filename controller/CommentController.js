import { Comments } from '../model';

export default class CommentController {
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
        ret.results = await Comments
          .find(filter, projection, options)
          .populate(populate)
          .lean(lean)
          .exec();
      } else {
        ret.results = await Comments
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

  async paginate({ filter, options = {} }) {
    try {
      const result = await Comments.paginate(filter, options);

      if (result) {
        return {
          success: true,
          message: 'You successfully retrieved some comment!',
          errors: [],
          results: result,
        };
      }
    } catch (e) {}

    return {
      success: false,
      message: '',
      errors: ['Something went wrong while trying to retrieve comment!'],
      results: [],
    };
  }

  async update({ filter, updates, options = {} }) {
    try {
      const result = await Comments.updateMany(filter, updates, options);

      if (result.ok) {
        return {
          success: true,
          message: 'You successfully updated that comment!',
          errors: [],
          results: [result],
        };
      }
    } catch (e) {}

    return {
      success: false,
      message: '',
      errors: ['Something went wrong while trying to update that comment!'],
      results: null,
    };
  }

  async create({
    content, review, user, replyTo,
  }) {
    const ret = {
      success: false,
      results: null,
      message: '',
      errors: [],
    };

    const comment = new Comments({
      content,
      review,
      user,
      replyTo,
    });

    try {
      ret.result = await comment.save();
      ret.success = true;
    } catch (e) {
      Object.keys(e.errors).forEach((error) => {
        ret.errors.push(error.message);
      });
    }

    return ret;
  }

  async delete({ filter, options = {} }) {
    try {
      const result = await Comments
        .deleteMany(filter, options)
        .exec();

      if (result.ok) {
        return {
          success: true,
          message: 'You successfully deleted that comment!',
          errors: [],
          results: [result],
        };
      }
    } catch (e) {}

    return {
      success: false,
      message: '',
      errors: ['Something went wrong while trying to delete that comment!'],
      results: null,
    };
  }
}
