import multer from 'multer';
import { Router } from 'express';
import { MovieController } from '../controller';

const up = multer({});

export default (function () {
  const route = Router();

  route.use('/', (_req, _res, next) => {
    if (_req.session.user && _req.session.user.admin) {
      next();
    } else {
      _res.status(404).render('error/404', {
        layout: 'account',
        active: { movies: true },
        user: _req.session.user,
      });
    }
  });

  route.get('/admin', (_req, _res) => {

  });

  route.post('/admin', up.single('poster'), (_req, _res) => {
    MovieController.create({
      title: _req.body.title,
      synopsis: _req.body.synopsis,
      price: _req.body.price,
      status: _req.body.status,
      poster: _req.file.buffer,
    }).then((result) => _res.send(result));
  });

  route.put('/admin', (_req, _res) => {
    const updates = {};

    Object.keys(_req.body).forEach((key, i, a) => {
      updates[key] = _req.body[key];
    });

    MovieController.update({
      filter: { _id: _req.body.id },
      updates,
    }).then((result) => _res.send(result));
  });

  route.delete('/admin', (_req, _res) => {
    MovieController.delete({
      filter: { _id: _req.body.id },
    }).then((result) => _res.send(result));
  });

  return route;
}());
