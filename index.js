import path from 'path';
import express from 'express';
import mongoose from 'mongoose';
import { urlencoded } from 'body-parser';
import cookieParser from 'cookie-parser';
import expressSession from 'express-session';
import hbs from 'express-hbs';
import route from './route';
import {
  datePrint, iff, img, abbreviateNumber,
} from './helpers';

const app = express();

const port = process.env.PORT || 3000;

function connect() {
  const databaseUrl = 'mongodb+srv://mp2_carreonpunovelascco:carreonpunovelasco@cluster0.dhmee.mongodb.net/MP2?retryWrites=true&w=majority';
  mongoose.connection
    .on('error', console.log)
    .on('disconnected', connect)
    .on('connected', (db) => console.log('Connected!'));

  return mongoose.connect(databaseUrl, {
    keepAlive: 1,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// load hbs helpers
hbs.registerHelper('datePrint', datePrint);
hbs.registerHelper('iff', iff);
hbs.registerHelper('img', img);
hbs.registerHelper('abbreviateNumber', abbreviateNumber);

// setup express server
app.use(urlencoded({ extended: false }));

// MS * S * M * H * D
app.use(cookieParser());

app.use(expressSession({
  secret: 'movieMetroSecret',
  saveUninitialized: true,
  resave: false,
}));

app.use(express.static('public'));

app.engine('hbs', hbs.express4({
  partialsDir: path.join(__dirname, 'views', 'partials'),
  layoutsDir: path.join(__dirname, 'views', 'layouts'),
}));

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.listen(port, () => {
  console.log(`Server started at port: ${port}`);
  console.log('Attempting to connect to atlas...');
  connect();
});

app.use('/', route); // include routes
