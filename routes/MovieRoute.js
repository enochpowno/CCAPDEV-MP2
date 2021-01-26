import multer from 'multer';
import { Router } from 'express';
import { MovieController, querify } from '../controller';
import { mustLogin } from './index';

const up = multer({});

const paginationOptions = {
  sort: 'date',
  page: 1,
  limit: 15,
  lean: true,
  select: '-reviews -poster',
};

export default (function () {
  const route = Router();

  route.get('/', (_req, _res) => {
    MovieController.get({
      filter: {
        title: querify(_req.query.q),
      },
      populate: true,
      lean: true,
    }).then((result) => _res.send(result));
  });

  route.post('/', up.single('poster'), (_req, _res) => {
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

  route.put('/', (_req, _res) => {
    if (mustLogin(_req, true)) {
      if (_req.body.movie) {
        const updates = {};

        Object.keys(_req.body).forEach((key, i, a) => {
          updates[key] = _req.body[key];
        });

        MovieController.update({
          filter: { _id: _req.body.id },
          updates,
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

  route.delete('/', (_req, _res) => {
    if (mustLogin(_req, true)) {
      if (_req.body.movies) {
        MovieController.delete({
          _id: _req.body.movie,
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
        MovieController.update({
          filter: {
            _id: _req.body.movie,
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

    paginationOptions.page = _req.query.page || 1;
    paginationOptions.page = (paginationOptions.page <= 0) ? 1 : paginationOptions.page;

    MovieController.paginate({
      filter,
      options: paginationOptions,
    }).then((result) => _res.send(result));
  });

  route.get('/view/search', (_req, _res) => {
    _res.render('search', {
      layout: 'default',
      user: _req.session.user,
    });
  });

  route.get('/view/:movie', (_req, _res) => {
    MovieController.get({
      filter: { _id: _req.params.movie },
      projection: '-reviews -poster',
    }).then((result) => {
      if (!result.success) {
        _res.status(404).render('error/404', {
          layout: 'error',
          user: _req.session.user,
        });
      } else {
        _res.render('movie', {
          layout: 'default',
          user: _req.session.usesr,
          active: { movie: true },
        });
      }
    });
  });

  return route;
}());
