const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const {
  Movies, Users, Comments, Reviews,
} = require('../model');

function mock() {
  const mockArray = [];
  console.log('Started making mocks...');

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

  Promise.all(mockArray).then((data) => {
    const movies = data[0];
    const users = data[1];
    const mockArray0 = [];

    // generate random reviews (each movie can have 0 - 4 reviews)
    console.log('Creating Reviews...');
    movies.forEach((movie) => {
      const numReviews = Math.floor(Math.random() * 3);

      for (let i = 0; i < numReviews; i += 1) {
        const randUser = Math.floor(Math.random() * users.length);
        mockArray0.push(new Promise((resolve, reject) => {
          const review = new Reviews({
            user: users[randUser]._id,
            movie: movie._id,
            content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sit amet ornare sapien. Etiam ultricies id diam quis bibendum. Ut ut nulla vitae risus vehicula molestie at quis est. Cras sed sagittis est. Pellentesque cursus ligula elit, eget vehicula nulla blandit a. Cras vitae consequat velit, at ultrices risus. Curabitur sed ante congue, vestibulum enim sit amet, commodo sapien. Morbi nulla nunc, convallis ornare imperdiet non, efficitur ut urna. Nam odio lacus, congue sed ullamcorper nec, pretium vitae justo. Donec eu ullamcorper purus.',
            title: 'Lorem ipsum',
          });

          review.save().then((result) => {
            resolve(review);
          });
        }));
      }
    });

    Promise.all(mockArray0).then((reviews) => {
      console.log('Finished creating reviews data...');
      mongoose.connection.close();
    });
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
