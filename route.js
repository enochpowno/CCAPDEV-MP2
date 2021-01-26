import multer from 'multer';
import { Router } from 'express';
import { AdminRoute, UserRoute } from './routes';

const up = multer({});

export default (function () {
  const route = Router();

  route.use('/', UserRoute);
  route.use('/admin', AdminRoute);

  return route;
}());
