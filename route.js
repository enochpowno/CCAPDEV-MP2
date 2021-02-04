import { Router } from 'express';
import { AccountController } from './controller';
import {
  AdminRoute, UserRoute, MovieRoute, CommentRoute, ReviewRoute,
} from './routes';

export default (function () {
  const route = Router();

  route.use('/', (_req, _res, next) => {
    if (!_req.session.user) {
      if (_req.cookies.cart) {
        _req.session.cart = _req.cookies.cart.split('|').filter(Boolean);
      }

      if (_req.cookies.user) {
        AccountController.get({
          filter: {
            _id: _req.cookies.user,
          },
          lean: true,
        }).then(({ success, results }) => {
          if (success && results.length > 0) {
            delete results[0].password;

            _req.session.user = results[0];
          } else {
            _res.clearCookie('user');
          }

          next();
        });
      } else {
        next();
      }
    } else {
      next();
    }
  });

  route.get('/', (_req, _res) => {
    _res.render('index', {
      layout: 'skeleton',
      cart: _req.session.cart,
      active: { home: true },
      title: 'Home Page',
      user: _req.session.user,
      script: ['home'],
    });
  });

  route.use('/user', UserRoute);
  route.use('/movie', MovieRoute);
  route.use('/admin', AdminRoute);
  route.use('/review', ReviewRoute);
  route.use('/comment', CommentRoute);

  route.get('*', (_req, _res) => {
    _res.render('error/404', {
      layout: 'error',
      cart: _req.session.cart,
      title: '404 Error',
    });
  });

  return route;
}());
