const mongoose = require('mongoose')

const userSchema = require('./Model/userSchema.js')
const User = mongoose.model('user', userSchema, 'user')

const movieSchema = require('./Model/movieSchema.js')
const Movie = mongoose.model('movie', movieSchema, 'movie')

const moviepostSchema = require('./Model/moviepostSchema.js')
const MoviePost = mongoose.model('moviepost', moviepostSchema, 'moviepost')

const commentSchema = require('./Model/commentSchema.js')
const Comment = mongoose.model('comment', commentSchema, 'comment')


function createUser(fullname, username, password, email) {
    return new User({
        fullname,
        username,
        password,
        email
    }).save()
}

function findUser() {
    User.find({}).lean().exec(function (err, users) {
        console.log(users)
    })
}

function createMovie(title, poster, synopsis, upvote, downvote, price, status) {
    return new Movie({
        title,
        poster,
        synopsis,
        upvote,
        downvote,
        price,
        status
    }).save()
}

function findMovie() {
    Movie.find({}).lean().exec(function (err, users) {
        console.log(users)
    })
}

function createMoviePost(title, poster, synopsis, upvote, downvote, price, status, username1, review, username2, comment, title) {
    return new MoviePost({
        title,
        poster,
        synopsis,
        upvote,
        downvote,
        price,
        status,
        username1,
        review,
        username2,
        comment,
        title,
        date: Date.now()
    }).save()
}

function findMoviePost() {
    MoviePost.find({}).lean().exec(function (err, users) {
        console.log(users)
    })
}

function createComment(username, comment, title) {
    return new Comment({
        username,
        comment,
        title,
        date: Date.now()
    }).save()
}

function findComment() {
    Comment.find({}).lean().exec(function (err, users) {
        console.log(users)
    })
}


connect()
createUser("Juan Two", "juantwo35", "two123juan", "juantwo@dlsu.edu.ph")
findUser()
createMovie("The dark", "jpg", "About a dark mammal", "45", "12", "120.50", "available")
findMovie()
createMoviePost("The dark", "jpg", "About a dark mammal", "45", "12", "120.50", "available", "juantwo35", "Magnificent!", "juantwo35", "I liked it!", "The dark")
findMoviePost()
createComment("juantwo35", "I liked it!", "The dark")
findComment()

function connect() {
    databaseUrl = 
"mongodb+srv://mp2_carreonpunovelascco:carreonpunovelasco@cluster0.dhmee.mongodb.net/MP2?retryWrites=true&w=majority"
    mongoose.connection
      .on('error', console.log)
      .on('disconnected', connect)

      return mongoose.connect(databaseUrl, {
          keepAlive: 1,
          useNewUrlParser: true,
          useUnifiedTopology: true
      });
}