import multer from 'multer';
import { Router } from 'express';
import { AccountController } from '../controller';

const up = multer({});

export default (function () {
  const route = Router();

  return route;
}());
