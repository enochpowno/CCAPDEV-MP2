import multer from 'multer';
import { Router } from 'express';
import { CommentController } from '../controller';
import { mustLogin, querify } from './helpers';

const up = multer({});

const paginationOptions = {
  sort: 'date',
  page: 1,
  limit: 15,
  lean: true,
  select: '-reviews -poster',
};

export default (function () {
  const route = Router();

  return route;
}());
