import { Router } from 'express';
import { CommentController, ReviewController } from '../controller';
import { mustLogin, sanitize } from './helpers';

const paginationOptions = {
  sort: '-date',
  page: 1,
  limit: 15,
  lean: true,
  populate: [{
    path: 'user',
    select: 'username _id photo',
  }, {
    path: 'replyTo',
    populate: {
      path: 'user',
      select: 'username',
    },
  }],
};

export default (function () {
  const route = Router();

  route.post('/', sanitize, (_req, _res) => {
    if (mustLogin(_req)) {
      CommentController.create({
        content: _req.body.content,
        user: _req.session.user._id,
        review: _req.body.review,
        replyTo: _req.body.replyTo,
      }).then((result) => {
        result.results = {
          ...result.results,
          user: _req.session.user,
          owner: true,
        };
        _res.send(result);
      });
    } else {
      _res.send({
        success: false,
        message: '',
        results: null,
        errors: ['Uh oh! You\'re not allowed to do that!'],
      });
    }
  });

  route.delete('/', (_req, _res) => {
    if (mustLogin(_req)) {
      if (_req.body.comment) {
        CommentController.delete({
          filter: {
            _id: _req.body.comment,
          },
        }).then((result) => _res.send(result));
      } else {
        _res.send({
          success: false,
          message: '',
          results: null,
          errors: ['Oops! We can\'t find the comment you\'re trying to delete'],
        });
      }
    } else {
      _res.send({
        success: false,
        message: '',
        results: null,
        errors: ['Uh oh! You\'re not allowed to do that!'],
      });
    }
  });

  route.put('/vote/:type', (_req, _res) => {
    if (mustLogin(_req)) {
      if (_req.body.comment) {
        const push = {};
        const pull = {};
        const inc = {};

        if (_req.params.type == 'up') {
          push.upvoters = _req.session.user._id;
          pull.downvoters = _req.session.user._id;

          if (_req.body.hadDownvoted == 'true') {
            inc.downvote = -1;
          }

          inc.upvote = 1;
        } else if (_req.params.type == 'down') {
          push.downvoters = _req.session.user._id;
          pull.upvoters = _req.session.user._id;

          if (_req.body.hadUpvoted == 'true') {
            inc.upvote = -1;
          }

          inc.downvote = 1;
        }

        CommentController.update({
          filter: {
            _id: _req.body.comment,
          },
          updates: {
            $inc: inc,
            $push: push,
            $pull: pull,
          },
        }).then((result) => _res.send(result));
      } else {
        _res.send({
          success: false,
          message: '',
          results: null,
          errors: ['Oops! We can\'t find the comment you\'re trying to rate'],
        });
      }
    } else {
      _res.send({
        success: false,
        message: '',
        results: null,
        errors: ['Uh oh! You must be logged in to do that'],
      });
    }
  });

  route.get('/replies/:comment', (_req, _res) => {
    const pageOptClone = {
      ...paginationOptions,
      page: (_req.query.page && _req.query.page >= 1) ? parseInt(_req.query.page, 10) : 1,
      skip: (_req.query.skip && _req.query.skip >= 0) ? parseInt(_req.query.skip, 10) : 0,
    };

    CommentController.paginate({
      filter: {
        replyTo: _req.params.comment,
      },
      options: pageOptClone,
      owner: _req.session.user,
    }).then((result) => _res.send(result));
  });

  route.get('/:review', (_req, _res) => {
    const pageOptClone = {
      ...paginationOptions,
      page: (_req.query.page && _req.query.page >= 1) ? parseInt(_req.query.page, 10) : 1,
      skip: (_req.query.skip && _req.query.skip >= 0) ? parseInt(_req.query.skip, 10) : 0,
    };

    CommentController.paginate({
      filter: {
        review: _req.params.review,
      },
      options: pageOptClone,
      owner: _req.session.user,
    }).then((result) => {
      _res.send(result);
    });
  });

  return route;
}());
