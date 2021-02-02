import { Router } from 'express';
import {
  AccountController, CommentController, MovieController, ReviewController,
} from '../controller';
import { mustLogin, sanitize } from './helpers';

const paginationOptions = {
  sort: '-date',
  page: 1,
  limit: 15,
  lean: true,
};

export default (function () {
  const route = Router();

  route.post('/', sanitize, (_req, _res) => {
    if (mustLogin(_req)) {
      ReviewController.create({
        content: _req.body.content,
        user: _req.session.user._id,
        movie: _req.body.movie,
        title: _req.body.title,
      }).then((result) => {
        MovieController.update({
          filter: { _id: _req.body.movie },
          updates: {
            $push: {
              reviews: result.result._id,
            },
          },
        }).then((result0) => {
          AccountController.update({
            filter: { _id: _req.session.user._id },
            updates: {
              $push: {
                reviews: result.result._id,
              },
            },
          }).then((result1) => _res.send(result));
        });
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

  route.get('/delete', (_req, _res) => {
    if (mustLogin(_req)) {
      if (_req.query.review && _req.query.movie) {
        ReviewController.delete({
          filter: {
            _id: _req.query.review,
            user: _req.session.user._id,
            movie: _req.query.movie,
          },
        }).then((result) => {
          if (result.success) {
            _res.redirect(`/movie/view/${_req.query.movie}`);
          } else {
            _res.status(500).render('error/500', {
              layout: 'error',
              user: _req.session.user,
            });
          }
        });
      } else {
        _res.status(404).render('error/404', {
          layout: 'error',
          user: _req.session.user,
        });
      }
    } else {
      _res.status(404).render('error/404', {
        layout: 'error',
        user: _req.session.user,
      });
    }
  });

  route.put('/', sanitize, (_req, _res) => {
    if (mustLogin(_req)) {
      const updates = {};

      if (_req.body.password) {
        AccountController.get({
          filter: {
            _id: _req.session.user._id,
            password: AccountController.hash(_req.body.password),
          },
          projection: 'password',
        }).then((result) => {
          if (result.success && result.results.length > 0) {
            if (_req.body.id) {
              Object.keys(_req.body).forEach((key, i, a) => {
                if (_req.body[key] && key != 'review') updates[key] = _req.body[key];
              });

              ReviewController.update({
                filter: {
                  _id: _req.body.review,
                  user: _req.session.user._id,
                },
                updates,
              }).then((result0) => _res.send(result0));
            } else {
              _res.send({
                success: false,
                message: '',
                results: null,
                errors: ['Oops! We can\'t find the review you\'re trying to update'],
              });
            }
          } else {
            _res.send({
              success: false,
              results: null,
              message: '',
              errors: ['Invalid password, you need to input your current password before you can update anything!'],
            });
          }
        });
      } else {
        _res.send({
          success: false,
          results: null,
          message: '',
          errors: ['Your current password is required!'],
        });
      }
    } else {
      _res.send({
        success: false,
        results: null,
        message: '',
        errors: ['You must be logged in!'],
      });
    }
  });

  route.put('/vote/:type', (_req, _res) => {
    if (mustLogin(_req)) {
      if (_req.body.review) {
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

        ReviewController.update({
          filter: {
            _id: _req.body.review,
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
          errors: ['Oops! We can\'t find the review you\'re trying to rate'],
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

  route.get('/view', (_req, _res) => {
    if (_req.query.movie && _req.query.review) {
      MovieController.get({
        filter: { _id: _req.query.movie },
        projection: '-reviews -upvoters -downvoters',
      }).then((result) => {
        if (!result.success || result.results.length <= 0) {
          _res.status(404).render('error/404', {
            layout: 'error',
            user: _req.session.user,
          });
        } else {
          ReviewController.get({
            filter: { _id: _req.query.review },
            populate: {
              path: 'user',
              select: 'username photo',
            },
          }).then((result0) => {
            if (!result0.success || result0.results.length <= 0) {
              _res.status(404).render('error/404', {
                layout: 'error',
                user: _req.session.user,
              });
            } else {
              _res.render('review', {
                layout: 'default',
                skeleton: false,
                user: _req.session.user,
                active: { movie: true },
                review: result0.results[0],
                movie: result.results[0],
                title: `Review: ${result0.results[0].title}`,
                script: ['review', 'rpage.min'],
                voteStatus: (function () {
                  if (_req.session.user) {
                    for (let i = 0; i < result0.results[0].upvoters.length; i++) {
                      if (result0.results[0].upvoters[i].toString() == _req.session.user._id.toString()) return 'up';
                    }

                    for (let i = 0; i < result0.results[0].downvoters.length; i++) {
                      if (result0.results[0].downvoters[i].toString() == _req.session.user._id.toString()) return 'down';
                    }
                  }

                  return null;
                }()),
              });
            }
          });
        }
      });
    } else {
      _res.status(404).render('error/404', {
        layout: 'error',
        user: _req.session.user,
      });
    }
  });

  route.get('/:movie', (_req, _res) => {
    const pageOptClone = {
      ...paginationOptions,
      page: (_req.query.page && _req.query.page >= 1) ? parseInt(_req.query.page, 10) : 1,
      populate: {
        path: 'user',
        select: 'username photo',
      },
    };

    ReviewController.paginate({
      filter: {
        movie: _req.params.movie,
      },
      options: pageOptClone,
    }).then((result) => _res.send(result));
  });

  return route;
}());
