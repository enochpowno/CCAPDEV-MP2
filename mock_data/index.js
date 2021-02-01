const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const {
  Movies, Users, Comments, Reviews,
} = require('../model');

function mock() {
  const mockArray = [];
  console.log('Started making mocks...');

  mockArray.push(new Promise((resolve, reject) => {
    console.log('Clearing comments...');
    Comments.deleteMany({}).then(() => resolve());
  }));

  mockArray.push(new Promise((resolve, reject) => {
    console.log('Clearing reviews...');
    Reviews.deleteMany({}).then(() => resolve());
  }));

  mockArray.push(
    new Promise((resolve, reject) => {
      console.log('Clearing movies...');
      Movies.deleteMany({}).then(() => {
        console.log('Creating movie mock data...');
        const rawMovie = fs.readFileSync(path.join(__dirname, 'movies.json'));

        Movies.insertMany(JSON.parse(rawMovie).reduce((p, cur) => {
          cur.poster = Buffer.from(cur.poster.substr(cur.poster.indexOf(',') + 1), 'base64');

          p.push(cur);
          return p;
        }, [])).then((v) => {
          console.log('Finished creating movie mock data...');
          resolve(v);
        }).catch((err) => reject(err));
      });
    }),
  );

  mockArray.push(
    new Promise((resolve, reject) => {
      console.log('Clearing users..');
      Users.deleteMany({}).then(() => {
        console.log('Creating user mock data...');
        const rawUsers = fs.readFileSync(path.join(__dirname, 'users.json'));

        Users.insertMany(JSON.parse(rawUsers).reduce((p, cur) => {
          cur.photo = Buffer.from(cur.photo.substr(cur.photo.indexOf(',') + 1), 'base64');

          p.push(cur);
          return p;
        }, [])).then((v) => {
          console.log('Finished creating user mock data...');
          resolve(v);
        }).catch((err) => reject(err));
      });
    }),
  );

  Promise.all(mockArray).then((v) => {
    console.log('Finished creating mock data...');
    mongoose.connection.close();
  });
}

function connect() {
  console.log('Attempting to connect...');
  const databaseUrl = 'mongodb+srv://mp2_carreonpunovelascco:carreonpunovelasco@cluster0.dhmee.mongodb.net/MP2?retryWrites=true&w=majority';

  return mongoose.connect(databaseUrl, {
    keepAlive: 1,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }, () => {
    mock();
  });
}

connect();
