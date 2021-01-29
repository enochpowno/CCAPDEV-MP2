import { Router } from 'express';
import { AccountController } from './controller';
import {
  AdminRoute, UserRoute, MovieRoute, CommentRoute, ReviewRoute,
} from './routes';

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
      layout: 'default',
      active: { home: true },
      title: 'Home Page',
      user: _req.session.user,
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
      title: '404 Error',
    });
  });

  return route;
}());
