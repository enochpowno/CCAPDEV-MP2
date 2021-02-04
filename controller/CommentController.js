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

  async paginate({ filter, options = {}, owner = null }) {
    try {
      const result = await Comments.paginate(filter, options);

      if (result) {
        if (owner) {
          for (let i = 0; i < result.docs.length; i++) {
            if (typeof result.docs[i].user === 'string') {
              result.docs[i].owner = result.docs[i].user == owner._id;
            } else {
              result.docs[i].owner = result.docs[i].user._id == owner._id;
            }
          }
        }

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
      updates.date = Date.now();
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
    content, review, user, replyTo = null,
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
      const results = await comment.save();
      ret.results = comment.toObject();
      ret.success = true;
    } catch (e) {
      Object.keys(e.errors).forEach((error) => {
        ret.errors.push(e.errors[error].message);
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
