import multer from 'multer';
import { Router } from 'express';
import { AccountController } from '../controller';
import { mustLogin } from './index';

const up = multer({});

export default (function () {
  const route = Router();

  route.get('/', (_req, _res) => {
    if (mustLogin(_req)) {
      _res.redirect(`/view/${_req.session.user._id}`);
    } else {
      _res.status(404).render('error/404', {
        layout: 'error',
        user: _req.session.user,
      });
    }
  });

  route.put('/', up.single('photo'), (_req, _res) => {
    if (mustLogin(_req)) {
      const updates = {
        name: _req.body.name,
        password: _req.body.password,
        email: _req.body.email,
        photo: _req.file.buffer,
      };

      Object.keys(updates).forEach((key, i, a) => {
        if (!(updates[key])) delete updates[key];
      });

      AccountController.update({
        filter: { _id: _req.session.user._id },
        updates,
      }).then((result) => _res.send(result));
    } else {
      _res.send({
        success: false,
        results: null,
        message: '',
        errors: ['You must be logged in!'],
      });
    }
  });

  route.get('/view/:user', (_req, _res) => {
    if (_req.params.user == _req.session._id) {
      _res.send('user', {
        layout: 'default',
        active: { profile: true },
        user: _req.session.user,
        profile: _req.session.user,
        title: _req.session.name,
      });
    } else {
      AccountController.get({
        filter: { _id: _req.params.user },
        projection: '-reviews',
        lean: true,
      }).then((result) => {
        if (result.success) {
          _res.send('user', {
            layout: 'default',
            user: _req.session.user,
            profile: result.results[0],
            title: result.results[0],
          });
        } else {
          _res.status(404).render('error/404', {
            layout: 'error',
            user: _req.session.user,
          });
        }
      });
    }
  });

  route.get('/view/login', (_req, _res) => {
    if (!mustLogin(_req)) {
      _res.send('login', {
        layout: 'default',
        active: { login: true },
        title: 'Login',
      });
    } else {
      _res.status(403).render('error/403', {
        layout: 'error',
        user: _req.session.user,
      });
    }
  });

  route.post('/login', (_req, _res) => {
    if (!mustLogin(_req) && _req.body.username && _req.body.password) {
      AccountController.login({ username: _req.body.username, password: _req.body.password })
        .then((result) => {
          if (result.success && result.results) {
            _req.session.user = result.results[0];

            if (_req.body.cookie) {
              _res.cookie('user', _req.session.user._id, {
                maxAge: 1000 * 60 * 60 * 24 * 7 * 3, // 3 weeks
                httpOnly: false,
              });
            }
          }

          _res.send(result);
        });
    } else {
      _res.send({
        success: false,
        results: null,
        message: '',
        errors: ['A username and password is required to login.'],
      });
    }
  });

  route.get('/view/register', (_req, _res) => {
    if (!mustLogin(_req)) {
      _res.send('register', {
        layout: 'default',
        active: { register: true },
        title: 'Registration',
      });
    } else {
      _res.status(403).render('error/403', {
        layout: 'error',
        user: _req.session.user,
      });
    }
  });

  route.post('/register', up.single('photo'), (_req, _res) => {
    if (!mustLogin(_req)) {
      AccountController.create({
        name: _req.body.name,
        username: _req.body.username,
        password: _req.body.password,
        email: _req.body.email,
        photo: _req.file.buffer,
      }).then((result) => {
        _res.send(result);
      });
    } else {
      _res.send({
        success: false,
        results: null,
        message: '',
        errors: ['You\'re already logged in.'],
      });
    }
  });

  route.get('/logout', (_req, _res) => {
    delete _req.session.user;
    _res.clearCookie('user');

    _res.redirect('/');
  });

  return route;
}());
