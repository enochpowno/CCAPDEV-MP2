import multer from 'multer';
import {
  Router,
} from 'express';
import {
  AccountController, ReviewController,
} from '../controller';
import {
  mustLogin, sanitize,
} from './helpers';

const paginationOptions = {
  sort: '-date',
  page: 1,
  limit: 15,
  lean: true,
};

const up = multer({});

export default (function () {
  const route = Router();

  route.get('/', (_req, _res) => {
    if (mustLogin(_req)) {
      _res.redirect(`/user/view/${_req.session.user._id}`);
    } else {
      _res.status(404).render('error/404', {
        layout: 'error',
        user: _req.session.user,
      });
    }
  });

  route.put('/', up.single('photo'), (_req, _res) => {
    if (mustLogin(_req)) {
      let skip = false;
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
            if (_req.body.type == 'details') {
              updates.name = _req.body.name;
              updates.description = _req.body.description;

              if (_req.file) {
                updates.photo = _req.file.buffer;
              }
            } else if (_req.body.type == 'password') {
              if (_req.body.npassword && _req.body.cpassword) {
                if (_req.body.npassword == _req.body.cpassword) {
                  updates.password = AccountController.hash(_req.body.npassword);
                } else {
                  skip = true;
                  _res.send({
                    success: false,
                    message: '',
                    errors: ['New password and confirm password must be the same!.'],
                    results: null,
                  });
                }
              } else {
                skip = true;
                _res.send({
                  success: false,
                  message: '',
                  errors: ['A new password and confirm password is needed to update your account.'],
                  results: null,
                });
              }
            } else {
              skip = true;
              _res.send({
                success: false,
                message: '',
                errors: ['Invalid update type, please choose whether to update your details or your password.'],
                results: null,
              });
            }

            if (!skip) {
              AccountController.update({
                filter: {
                  _id: _req.session.user._id,
                },
                updates,
              }).then((result0) => {
                if (result0.success && _req.body.type == 'details') {
                  _req.session.user.description = _req.body.description;
                  _req.session.user.name = _req.body.name;

                  if (_req.file) {
                    _req.session.user.photo = _req.file.buffer;
                  }
                }

                _res.send(result0);
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

  route.get('/reviews/:user', (_req, _res) => {
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
        user: _req.params.user,
      },
      options: pageOptClone,
    }).then((result) => _res.send(result));
  });

  route.get('/view/login', (_req, _res) => {
    if (!mustLogin(_req)) {
      _res.render('login', {
        layout: 'default',
        active: {
          login: true,
        },
        title: 'Login',
        script: ['login'],
      });
    } else {
      _res.status(403).render('error/403', {
        layout: 'error',
        user: _req.session.user,
      });
    }
  });

  route.post('/login', sanitize, (_req, _res) => {
    if (!mustLogin(_req) && _req.body.username && _req.body.password) {
      AccountController.login({
        username: _req.body.username,
        password: _req.body.password,
      }).then((result) => {
        if (result.success) {
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
      _res.render('register', {
        layout: 'default',
        active: {
          register: true,
        },
        title: 'Registration',
        script: ['register'],
      });
    } else {
      _res.status(403).render('error/403', {
        layout: 'error',
        user: _req.session.user,
      });
    }
  });

  route.post('/register', up.single('photo'), sanitize, (_req, _res) => {
    if (!mustLogin(_req)) {
      AccountController.create({
        name: _req.body.name,
        username: _req.body.username,
        password: _req.body.password,
        email: _req.body.email,
        photo: _req.file.buffer,
        description: _req.body.description,
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

  route.get('/view/:user', (_req, _res) => {
    if (_req.session.user && _req.params.user == _req.session.user._id.toString()) {
      _res.render('user', {
        layout: 'default',
        active: {
          profile: true,
        },
        user: _req.session.user,
        profile: _req.session.user,
        title: _req.session.user.name,
        script: ['user', 'rpage.min'],
      });
    } else {
      AccountController.get({
        filter: {
          _id: _req.params.user,
        },
        lean: true,
      }).then((result) => {
        if (result.success) {
          _res.render('user', {
            layout: 'default',
            user: _req.session.user,
            profile: result.results[0],
            title: result.results[0].name,
            script: ['rpage.min'],
            active: {
              profile: true,
            },
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

  return route;
}());
