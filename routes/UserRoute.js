import multer from 'multer';
import { Router } from 'express';
import { AccountController } from '../controller';

const up = multer({});

export default (function () {
  const route = Router();

  route.use('/', (_req, _res, next) => {
    if (!_req.session.user) {
      if (_req.cookies.user) {
        AccountController.get({
          filter: {
            _id: _req.cookies.user._id,
          },
          lean: true,
        }).then(({ success, results }) => {
          if (success && results && results.length > 0) {
            delete results[0].password;
            delete results[0].reviews;

            _req.session.user = results[0];
          } else {
            _res.clearCookie('user');
          }
        });
      } else {
        next();
      }
    } else {
      next();
    }
  });

  route.get('/', (_req, _res) => {

  });

  route.get('/movies', (req, res) => {

  });

  route.get('/movies/search', (req, res) => {

  });

  return route;
}());
