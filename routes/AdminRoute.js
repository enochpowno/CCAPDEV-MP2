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
        layout: 'error',
        user: _req.session.user,
      });
    }
  });

  route.get('/admin', (_req, _res) => {
    _res.render('admin', {
      layout: 'admin',
      user: _req.session.user,
    });
  });

  return route;
}());
