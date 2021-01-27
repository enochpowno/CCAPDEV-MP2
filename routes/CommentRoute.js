import multer from 'multer';
import { Router } from 'express';
import { CommentController } from '../controller';
import { mustLogin } from './helpers';

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

  route.get('/:review', (_req, _res) => {
    CommentController.get({
      filter: {
        review: _req.params.review,
      },
      populate: false,
      lean: true,
    }).then((result) => _res.send(result));
  });

  route.post('/', (_req, _res) => {
    if (mustLogin(_req)) {

    }
  });

  route.delete('/', (_req, _res) => {
    if (mustLogin(_req)) {
      
    }
  });

  route.get('/replies/:comment', (_req, _res) => {
    
  });

  return route;
}());
