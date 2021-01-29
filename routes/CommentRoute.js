import { Router } from 'express';
import { CommentController } from '../controller';
import { mustLogin } from './helpers';

const paginationOptions = {
  sort: 'date',
  page: 1,
  limit: 15,
  lean: true,
};

export default (function () {
  const route = Router();

  route.get('/:review', (_req, _res) => {
    const pageOptClone = {
      ...paginationOptions,
      page: (_req.query.page && _req.query.page >= 1) ? parseInt(_req.query.page, 10) : 1,
    };

    CommentController.get({
      filter: {
        review: _req.params.review,
      },
      options: pageOptClone,
    }).then((result) => _res.send(result));
  });

  route.post('/', (_req, _res) => {
    if (mustLogin(_req)) {
      CommentController.create({
        content: _req.body.content,
        user: _req.session.user._id,
        review: _req.body.review,
        replyTo: _req.body.replyTo,
      }).then((result) => _res.send(result));
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
        CommentController.update({
          filter: {
            _id: _req.body.comment,
          },
          updates: {
            $inc: {
              upvote: (_req.params.type === 'up') ? 1 : 0,
              downvote: (_req.params.type === 'down') ? 1 : 0,
            },
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
    };

    CommentController.paginate({
      filter: {
        reply_to: _req.params.comment,
      },
      options: pageOptClone,
    }).then((result) => _res.send(result));
  });

  return route;
}());
