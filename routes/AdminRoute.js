import { Router } from 'express';

export default (function () {
  const route = Router();

  route.use('/', (_req, _res, next) => {
    if (_req.session.user && _req.session.user.admin) {
      next();
    } else {
      _res.status(500).render('error/403', {
        layout: 'error',
        title: 'Error 403',
        cart: _req.session.cart,
        user: _req.session.user,
      });
    }
  });

  route.get('/', (_req, _res) => {
    _res.render('admin', {
      layout: 'default',
      cart: _req.session.cart,
      user: _req.session.user,
      skeleton: true,
      title: 'Admin Panel',
      script: ['admin', 'rpage.min'],
      active: { admin: true },
      search: _req.query.q || '',
    });
  });

  return route;
}());
