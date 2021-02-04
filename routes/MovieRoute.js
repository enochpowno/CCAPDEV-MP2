import multer from 'multer';
import { Router } from 'express';
import axios from 'axios';
import { MovieController, AccountController } from '../controller';
import { mustLogin, querify, sanitize } from './helpers';

import { PayPal } from '../helpers';

const paypal = require('@paypal/checkout-server-sdk');

const up = multer({});
const environ = new paypal.core.SandboxEnvironment(PayPal.CLIENT, PayPal.SECRET);
const paypalClient = new paypal.core.PayPalHttpClient(environ);

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
        $or: [{
          title: querify(_req.query.q),
        }, {
          synopsis: querify(_req.query.q),
        }],
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

  route.post('/cart/add', (_req, _res) => {
    if (mustLogin(_req)) {
      if (_req.session.cart) {
        if (_req.session.cart.indexOf(_req.body.movie) > -1) {
          _res.send({
            success: false,
            message: '',
            errors: ['That movie was is already in your cart.'],
            results: _req.session.cart,
          });
        } else {
          _req.session.cart.push(_req.body.movie);
          _res.cookie('cart', _req.session.cart.join('|'), {
            maxAge: 1000 * 60 * 60 * 24 * 7 * 3, // 3 weeks
            httpOnly: false,
          });

          _res.send({
            success: true,
            message: 'That movie was succesfully added to your cart.',
            errors: [],
            results: _req.session.cart,
          });
        }
      } else {
        _req.session.cart = [_req.body.movie];
        _res.cookie('cart', _req.body.movie, {
          maxAge: 1000 * 60 * 60 * 24 * 7 * 3, // 3 weeks
          httpOnly: false,
        });

        _res.send({
          success: true,
          message: 'That movie was succesfully added to your cart.',
          errors: [],
          results: _req.session.cart,
        });
      }
    } else {
      _res.send({
        success: false,
        message: '',
        errors: ['You must be logged in to add to your cart.'],
        results: _req.session.cart,
      });
    }
  });

  route.delete('/cart/remove', (_req, _res) => {
    if (mustLogin(_req)) {
      if (_req.session.cart) {
        if (_req.session.cart.indexOf(_req.body.movie) > -1) {
          _req.session.cart.splice(_req.session.cart.indexOf(_req.body.movie), 1);
          _res.cookie('cart', _req.session.cart.join('|'), {
            maxAge: 1000 * 60 * 60 * 24 * 7 * 3, // 3 weeks
            httpOnly: false,
          });

          _res.send({
            success: true,
            message: 'That movie was succesfully removed from your cart.',
            errors: [],
            results: [_req.session.cart],
          });
        } else {
          _res.send({
            success: false,
            message: '',
            errors: ['That movie was isn\'t in your cart.'],
            results: [_req.session.cart],
          });
        }
      } else {
        _res.send({
          success: false,
          message: '',
          errors: ['Your cart is empty.'],
          results: [_req.session.cart],
        });
      }
    } else {
      _res.send({
        success: false,
        message: '',
        errors: ['Your must be logged in to remove from your cart.'],
        results: [_req.session.cart],
      });
    }
  });

  route.get('/cart/clear', (_req, res) => {
    if (_req.session.cart) delete _req.session.cart;

    res.redirect('/movie/view/cart');
  });

  route.post('/cart/purchase', (_req, _res) => {
    if (_req.session.cart) {
      MovieController.get({
        filter: {
          _id: {
            $in: _req.session.cart,
          },
          status: 'available',
        },
        projection: '_id title price',
      }).then((result) => {
        let total = 0;
        _req.session.availables = [];
        const items = result.results.reduce((arr, movie) => {
          arr.push({
            name: movie.title,
            quantity: 1,
            sku: movie._id.toString(),
            unit_amount: {
              currency_code: 'USD',
              value: movie.price.toFixed(2),
            },
          });

          _req.session.availables.push(movie._id.toString());
          total += movie.price;

          return arr;
        }, []);

        total = total.toFixed(2);
        const request = new paypal.orders.OrdersCreateRequest();
        request.headers.prefer = 'return=representation';

        request.requestBody({
          intent: 'CAPTURE',
          redirect_urls: {
            return_url: '/movie/cart/purchase/success',
            cancel_url: '/movie/view/cart',
          },
          payment_method: 'paypal',
          purchase_units: [{
            reference_id: Date.now(),
            description: 'Movie Metro',
            amount: {
              currency_code: 'USD',
              value: total,
              breakdown: {
                item_total: {
                  currency_code: 'USD',
                  value: total,
                },
              },
            },
            items,
          }],
        });

        paypalClient.execute(request).then((response) => {
          _res.status(200).send(response.result);
        }).catch((e) => {
          _res.sendStatus(500);
        });
      });
    } else {
      _res.sendStatus(404);
    }
  });

  route.post('/cart/purchase/complete', (_req, _res) => {
    if (mustLogin(_req)) {
      AccountController.update({
        filter: {
          _id: _req.session.user._id,
        },
        updates: {
          $push: {
            watched: {
              $each: _req.session.cart,
            },
          },
        },
      }).then((result) => {
        _req.session.orderID = _req.body.orderID;
        if (_req.session.availables) {
          _req.session.user.watched.push(..._req.session.availables);

          _req.session.cart = _req.session.cart.filter((v) => !_req.session.availables.includes(v.toString()));
        }

        _res.cookie('cart', _req.session.cart.join('|'), {
          maxAge: 1000 * 60 * 60 * 24 * 7 * 3, // 3 weeks
          httpOnly: false,
        });

        delete _req.session.availables;
        _res.send(result);
      });
    } else {
      _res.send({
        success: false,
        message: '',
        errors: ['You must be logged in to purchase the movies in your cart.'],
        results: [_req.session.cart],
      });
    }
  });

  route.get('/view/cart/purchase/complete', (_req, _res) => {
    if (mustLogin(_req)) {
      if (_req.session.orderID) {
        const ordID = _req.session.orderID;
        delete _req.session.orderID;

        _res.render('complete', {
          layout: 'default',
          order: ordID,
          cart: _req.session.cart,
          user: _req.session.user,
          title: 'Purchase Completed',
        });
      } else {
        _res.redirect('/movie/view/cart');
      }
    } else {
      _res.status(404).render('error/404', {
        layout: 'error',
        cart: _req.session.cart,
        user: _req.session.user,
      });
    }
  });

  route.get('/view/cart', (_req, _res) => {
    if (mustLogin(_req)) {
      MovieController.get({
        filter: { _id: { $in: _req.session.cart || [] } },
        projection: '_id title price status poster',
      }).then((result) => {
        _res.render('cart', {
          layout: 'default',
          cart: result.results,
          user: _req.session.user,
          script: ['cart'],
          active: { cart: true },
          title: 'Cart',
        });
      });
    } else {
      _res.status(404).render('error/404', {
        layout: 'error',
        cart: _req.session.cart,
        user: _req.session.user,
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

          if (_req.body.hadDownvoted == 'true') {
            inc.downvote = -1;
          }

          inc.upvote = 1;
        } else if (_req.params.type == 'down') {
          push.downvoters = _req.session.user._id;
          pull.upvoters = _req.session.user._id;

          if (_req.body.hadUpvoted == 'true') {
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
      filter.$or = [
        {
          title: querify(_req.query.q),
        }, {
          synopsis: querify(_req.query.q),
        }];
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
      cart: _req.session.cart,
      title: `Movie Search: ${_req.query.q}`,
      script: ['search', 'rpage.min'],
      search: _req.query.q,
    });
  });

  route.get('/view/:movie', (_req, _res) => {
    MovieController.get({
      filter: { _id: _req.params.movie },
    }).then((result) => {
      if (!result.success || result.results.length <= 0) {
        _res.status(404).render('error/404', {
          layout: 'error',
          cart: _req.session.cart,
          user: _req.session.user,
        });
      } else {
        _res.render('movie', {
          layout: 'default',
          skeleton: false,
          user: _req.session.user,
          active: { movie: true },
          movie: result.results[0],
          cart: _req.session.cart,
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
