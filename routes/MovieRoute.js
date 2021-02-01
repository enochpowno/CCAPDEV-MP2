import multer from 'multer';
import { Router } from 'express';
import { MovieController, AccountController } from '../controller';
import { mustLogin, querify, sanitize } from './helpers';

const up = multer({});

const paginationOptions = {
  sort: '-date',
  page: 1,
  limit: 15,
  lean: true,
  select: '-reviews',
};

export default (function () {
  const route = Router();

  route.get('/', (_req, _res) => {
    MovieController.get({
      filter: {
        title: querify(_req.query.q),
      },
      populate: false,
      lean: true,
    }).then((result) => _res.send(result));
  });

  route.get('/top', (_req, _res) => {
    MovieController.get({
      filter: {},
      options: {
        sort: {
          upvote: -1,
          date: -1,
        },
        limit: (_req.query.limit) ? parseInt(_req.query.limit) : 1,
        skip: (_req.query.skip) ? parseInt(_req.query.skip) : 0,
      },
      populate: false,
      lean: true,
    }).then((result) => _res.send(result));
  });

  route.get('/recent', (_req, _res) => {
    MovieController.get({
      filter: {},
      options: {
        sort: {
          date: -1,
        },
        limit: 1,
      },
      populate: false,
      lean: true,
    }).then((result) => _res.send(result));
  });

  route.post('/', up.single('poster'), sanitize, (_req, _res) => {
    if (mustLogin(_req, true)) {
      MovieController.create({
        title: _req.body.title,
        synopsis: _req.body.synopsis,
        price: _req.body.price,
        status: _req.body.status,
        poster: _req.file.buffer,
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

  route.put('/', up.single('poster'), sanitize, (_req, _res) => {
    if (mustLogin(_req, true)) {
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
                if (_req.body[key] && key != 'id') updates[key] = _req.body[key];
              });

              if (_req.file) {
                updates.poster = _req.file.buffer;
              }

              MovieController.update({
                filter: { _id: _req.body.id },
                updates,
              }).then((result0) => _res.send(result0));
            } else {
              _res.send({
                success: false,
                message: '',
                results: null,
                errors: ['Oops! We can\'t find the movie you\'re trying to update'],
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

  route.delete('/', (_req, _res) => {
    if (mustLogin(_req, true)) {
      if (_req.body.movie) {
        MovieController.delete({
          filter: {
            _id: _req.body.movie,
          },
        }).then((result) => _res.send(result));
      } else {
        _res.send({
          success: false,
          message: '',
          results: null,
          errors: ['Oops! We can\'t find the movie you\'re trying to delete'],
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
      if (_req.body.movie) {
        const push = {};
        const pull = {};
        const inc = {};

        if (_req.params.type == 'up') {
          push.upvoters = _req.session.user._id;
          pull.downvoters = _req.session.user._id;

          if (_req.body.hadDownvoted) {
            inc.downvote = -1;
          }

          inc.upvote = 1;
        } else if (_req.params.type == 'down') {
          push.downvoters = _req.session.user._id;
          pull.upvoters = _req.session.user._id;

          if (_req.body.hadUpvoted) {
            inc.upvote = -1;
          }

          inc.downvote = 1;
        }

        MovieController.update({
          filter: {
            _id: _req.body.movie,
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
          errors: ['Oops! We can\'t find the movie you\'re trying to rate'],
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

  route.get('/search', (_req, _res) => {
    const filter = {};

    if (_req.query.q) {
      filter.title = querify(_req.query.q);
    }

    const pageOptClone = {
      ...paginationOptions,
      page: (_req.query.page && _req.query.page >= 1) ? parseInt(_req.query.page, 10) : 1,
    };

    MovieController.paginate({
      filter,
      options: pageOptClone,
    }).then((result) => _res.send(result));
  });

  route.get('/view/search', (_req, _res) => {
    _res.render('search', {
      layout: 'default',
      skeleton: true,
      user: _req.session.user,
      title: `Movie Search: ${_req.query.q}`,
      script: ['search', 'rpage.min'],
      search: _req.query.q,
    });
  });

  route.get('/view/:movie', (_req, _res) => {
    MovieController.get({
      filter: { _id: _req.params.movie },
    }).then((result) => {
      if (!result.success && result.results.length > 0) {
        _res.status(404).render('error/404', {
          layout: 'error',
          user: _req.session.user,
        });
      } else {
        _res.render('movie', {
          layout: 'default',
          skeleton: false,
          user: _req.session.user,
          active: { movie: true },
          movie: result.results[0],
          voteStatus: (function () {
            if (_req.session.user) {
              for (let i = 0; i < result.results[0].upvoters.length; i++) {
                if (result.results[0].upvoters[i].toString() == _req.session.user._id.toString()) return 'up';
              }

              for (let i = 0; i < result.results[0].downvoters.length; i++) {
                if (result.results[0].downvoters[i].toString() == _req.session.user._id.toString()) return 'down';
              }
            }

            return null;
          }()),
          title: result.results[0].title,
          script: ['movie', 'rpage.min'],
        });
      }
    });
  });

  return route;
}());
