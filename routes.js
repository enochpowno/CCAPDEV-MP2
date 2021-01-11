const mongoose = require('mongoose')

const movieSchema = require('./model/movieSchema.js')
const Movie = mongoose.model('movie', movieSchema, 'movie')

const reviewSchema = require('./model/reviewSchema.js')
const Review = mongoose.model('review', reviewSchema, 'review')

const userSchema = require('./model/userSchema.js')
const Users = mongoose.model('user', userSchema, 'user')

const commentSchema = require('./model/commentSchema.js')
const Comment = mongoose.model('comment', commentSchema, 'comment')

const multer = require('multer')
const up = multer({})

module.exports = (function() {
    const route = require('express').Router()

    route.use('/', (req, res, next) => {
        if (!req.session.user) {
            if (req.cookies["user"]) {
                Users.findById(req.cookies["user"]).lean().then((doc) => {
                    if (doc) {
                        delete doc.reviews
                        req.session.user = doc
                    }

                    next()
                })
            } else {
                next()
            }
        } else {
            next()
        }
    })

    route.get('/', (req, res) => {
        let message = null
        if (req.session.message) {
            message = {...req.session.message}
            delete req.session.message
        }

        Movie.find({}, {}, {sort: {'date': -1}}).lean().exec(function (err, results) {
            let limit = 20
            
            Movie.findOne({}, {}, { sort: {'upvote': -1} }).lean().exec(function(err1, results1) {
                res.render('index', {
                    title: 'Movie Metro',
                    layout: 'default',
                    active: { home: true },
                    results,
                    top: results1,
                    user: req.session.user,
                    message: message
                })
            })
        })
    })

    route.get('/movies', (req, res) => {
        let message = null

        if (req.session.message) {
            message = {...req.session.message}
            delete req.session.message
        }

        if (req.query.q) { // query was made, do some code for getting search
            let parameters = req.query.q.replace(/\s+/, ' ').trim().split(/\s/).reduce(
                (accum, curr) => {
                    accum.push(new RegExp(curr, 'i'))

                    return accum
                }, [new RegExp(req.query.q, 'i')])
            
            Movie.find({'title': { $in: parameters}}).lean().exec(function (err, results) {
                let limit = 15
                let maxPages = Math.ceil(results.length / limit)
                let page = parseInt(req.query.page) || 1
                
                res.render('movies', {
                    title: 'Movie Metro - Search',
                    layout: 'default',
                    active: { movies: true  },
                    style: ['movies'],
                    script: ['movies'],
                    q: req.query.q || '',
                    maxPages,
                    page,
                    results: (results.length == 0) ? results : results.slice((page - 1) * limit, page * limit),
                    user: req.session.user,
                    message
                })
            })
        } else {
            res.render('movies', {
                title: 'Movie Metro - Search',
                layout: 'default',
                active: { movies: true  },
                style: ['movies'],
                script: ['movies'],
                results: null,
                user: req.session.user
            })
        }
    })

    route.get('/movies/details', (req, res) => {
        let message = null

        if (req.session.message) {
            message = {...req.session.message}
            delete req.session.message
        }

        if (req.query.id) {
            Movie.findOne({ _id: req.query.id }).lean().exec((err, result) => {
                if (result) {
                    Review.find({ '_id' : { $in : result.reviews }}, {}, { sort: { 'date': -1 } }).lean().exec((err, reviews) => {
                        res.render('details', {
                            layout: 'default',
                            active: { movies: true  },
                            result,
                            reviews,
                            user: req.session.user,
                            message
                        })
                    })
                } else {
                    res.status(404).render('error/404', {
                        layout: 'account',
                        active: { movies: true  },
                        user: req.session.user,
                        message
                    })
                }
            })
        } else {
            res.redirect('/movies')
        }
    })

    route.get('/movies/review', (req, res) => {
        let message = null

        if (req.session.message) {
            message = {...req.session.message}
            delete req.session.message
        }

        if (req.query.id && req.query.movie) {
            Movie.findOne({ _id: req.query.movie }).lean().exec(function (err, movie) {
                if (movie) {
                    Review.findOne({ '_id' : req.query.id}).lean().exec(function (err, review) {
                        if (review) {
                            Comment.find({ '_id': {$in: review.comments} }, {}, {'sort': {'date': -1}}).lean().exec(function (err, comments) {
                                console.log(comments)
                                res.render('reviews', {
                                    title: `Movie Review - ${movie.title} Details`,
                                    layout: 'default',
                                    active: { movies: true  },
                                    movie: movie,
                                    review: review,
                                    comments: comments,
                                    user: req.session.user,
                                    message
                                })
                            })
                        } else {
                            res.status(404).render('error/404', {
                                layout: 'account',
                                active: { movies: true  },
                                user: req.session.user,
                                message
                            })
                        }
                    })
                } else {
                    res.status(404).render('error/404', {
                        layout: 'account',
                        active: { movies: true  },
                        user: req.session.user,
                        message
                    })
                }
            })
        } else {
            res.redirect('/movies')
        }
    })

    route.post('/movies/review/add', (req, res) => {
        const newReview = new Review({
            review: req.body.review,
            title: req.body.title,
            movie_id: req.body.movie_id,
            user_id: req.session.user._id,
            username: req.session.user.username
        });

        newReview.save(function(err, newReview) {
            if (err) {
                req.session.message = {
                    classes: 'text-white bg-danger',
                    message: 'Oops! Something went wrong while trying to create your review...'
                }

                res.redirect(`/movies/details?id=${req.body.movie_id}`)
            } else {
                Users.updateOne({ _id: req.session.user._id}, { $push: { reviews: newReview._id } })
                .then((doc) => {
                    
                    Movie.updateOne({ _id: req.body.movie_id}, { $push: { reviews: newReview._id } })
                    .then((doc) => {
                        
                        req.session.message = {
                            classes: 'text-white bg-success',
                            message: 'Yay! your review was uploaded...'
                        }

                        res.redirect(`/movies/details?id=${req.body.movie_id}#reviews`)
                    })
                })
            }

        })
    })

    route.post('/movies/review/comment', (req, res) => {
        const newComment = new Comment({
            comment: req.body.comment,
            review_id: req.body.review_id,
            user_id: req.session.user._id,
            username: req.session.user.username
        });

        newComment.save(function (err, newComment) {
            if (err) {
                req.session.message = {
                    classes: 'text-white bg-danger',
                    message: 'Ohno! your comment wasn\'t uploaded...'
                }

                res.redirect('back')
            } else {
                Review.findByIdAndUpdate({ _id: req.body.review_id }, { $push: { comments: newComment._id } })
                .then((doc) => {
                    req.session.message = {
                        classes: 'text-white bg-success',
                        message: 'Yay! your comment was uploaded...'
                    }

                    res.redirect(`/movies/review?id=${req.body.review_id}&movie=${doc.movie_id}#comments`)
                })
            }
        })
    })

    route.get('/login', (req, res) => {
        let message = null
        if (req.session.message) {
            message = {...req.session.message}
            delete req.session.message
        }

        res.render('login', {
            title: 'Movie Metro - Log In',
            layout: 'account',
            active: {login: true},
            user: req.session.user,
            message: message
        })
    })

    route.post('/login', (req, res) => {
        if (req.body.username && req.body.password) {
            Users.findOne({'username': req.body.username}).then((doc)=>{
                if(doc == null){
                    res.render('login', {
                        title: 'Movie Metro - Log In',
                        layout: 'account',
                        active: {login: true},
                        message: {
                            classes: 'text-white bg-danger',
                            message: 'Uh oh! Looks like your account doesn\'t exist'
                        }
                    })
                }else{
                    if (doc.password === req.body.password) { 
                        if (req.body.cookie) {
                            res.cookie('user', doc._id, {
                                maxAge: 1000 * 60 * 60 * 24 * 7 * 3, // 3 weeks
                                httpOnly: false
                            })
                        }

                        delete doc.reviews
                        req.session.user = doc
                        res.redirect("/")
                    } 
                    else { 
                        res.render('login', {
                            title: 'Movie Metro - Log In',
                            layout: 'account',
                            active: {login: true},
                            message: {
                                classes: 'text-white bg-danger',
                                message: 'Uh oh! Looks like your password is incorrect'
                            }
                        })
                    }
                }
            })
        } else {
            res.render('login', {
                title: 'Movie Metro - Log In',
                layout: 'account',
                active: {login: true},
                message: {
                    classes: 'text-white bg-danger',
                    message: 'Oops! You need a username and a password to login!'
                }
            })
        }
    })

    route.get('/logout', (req, res) => {
        delete req.session.user
        res.clearCookie('user')

        res.redirect('/')
    })

    route.get('/register', (req, res) => {
        let message = null

        if (req.session.message) {
            message = {...req.session.message}
            delete req.session.message
        }

        res.render('register', {
            title: 'Movie Metro - Register',
            layout: 'account',
            active: {register: true},
            message
        })
    })

    route.post('/register', (req, res) => {
        if (req.body.username && req.body.password && req.body.email && req.body.name) {
            Users.findOne( { $or: [{
                'username': req.body.username,
                'email': req.body.email
            }] } ).then((doc) => {
                if (!doc) {
                    const newUser = new Users({
                        username: req.body.username,
                        password: req.body.password,
                        email: req.body.email,
                        fullname: req.body.name
                    });

                    newUser.save(function (err, user) {
                        if (err) {
                            res.render('register', {
                                title: 'Movie Metro - Register',
                                layout: 'account',
                                active: {register: true},
                                message: {
                                    classes: 'text-white bg-danger',
                                    message: 'Uh oh! Looks like that something went wrong while trying to register!'
                                }
                            })
                        } else {
                            req.session.message = {
                                classes: 'text-white bg-success',
                                message: 'Yay! You\'ve successfully registered!'
                            }

                            res.redirect('/login')
                        }
                    })
                } else {
                    res.render('register', {
                        title: 'Movie Metro - Register',
                        layout: 'account',
                        active: {register: true},
                        message: {
                            classes: 'text-white bg-danger',
                            message: 'Oops! Looks like that email or username is already taken!'
                        }
                    })
                }
            })
        } else {
            res.render('register', {
                title: 'Movie Metro - Register',
                layout: 'account',
                active: {register: true},
                message: {
                    classes: 'text-white bg-danger',
                    message: 'Oops! Make sure you\'ve filled in all your data!'
                }
            })
        }
    })

    route.get('/profile', (req, res) => {
        var id = null;

        if (req.session.user && !req.query.id) {
            id = req.session.user._id
        } else if (req.query.id) {
            id = req.query.id
        }

        let message = null

        if (req.session.message) {
            message = {...req.session.message}
            delete req.session.message
        }

        if (id) {
            Users.findById(id).lean().then((user)=>{
                Review.find({ '_id': { $in: user.reviews } }).lean().then((reviews) => {
                    let movieIds = reviews.reduce((accum, curr) => {
                        accum.push(curr.movie_id)
                        return accum
                    }, [])

                    Movie.find({ '_id': {$in: movieIds} }).lean().then((movies) => {
                        let reviews0 = reviews.reduce((accum, curr) => {
                            for(i = 0; i < movies.length; i++) {
                                if (movies[i]._id == curr.movie_id) {
                                    accum.push({
                                        review: curr,
                                        movie: movies[i]
                                    })
                                    break
                                }
                            }

                            return accum
                        }, [])

                        res.render('profile', {
                            layout: 'account',
                            active: { profile: true  },
                            user: req.session.user,
                            profile: user,
                            reviews: reviews0,
                            message
                        })
                    })
                })
            })
        } else {
            res.status(404).render('error/404', {
                layout: 'account',
                active: { profile: true  },
                user: req.session.user,
                message
            })
        }
    })

    route.get('/admin', (req, res) => {
        let message = null

        if (req.session.message) {
            message = {...req.session.message}
            delete req.session.message
        }
        
        Movie.find({}).sort({date: -1}).lean().exec(function (err, movies) {
            let limit = 15
            let maxPages = Math.ceil(movies.length / limit)
            let page = parseInt(req.query.page) || 1
            
            res.render('admin', {
                title: 'Movie Metro - Admin',
                layout: 'account',
                active: { admin: true  },
                maxPages,
                page,
                movies: (movies.length == 0) ? movies : movies.slice((page - 1) * limit, page * limit),
                user: req.session.user,
                message
            })
        })
    })

    route.post('/admin/add', up.single('photo'), (req, res) => {
        const newMovie = new Movie({
            title: req.body.title,
            synopsis: req.body.synopsis,
            price: req.body.price,
            upvote: 0,
            downvote: 0,
            status: 'available',
            poster: req.file.buffer
        });

        newMovie.save(function (err, newMovie) {
            console.log(err)
            if (err) {
                req.session.message = {
                    classes: 'text-white bg-danger',
                    message: `An error occured while adding the move: ${req.body.title}`
                }
            } else {
                req.session.message = {
                    classes: 'text-white bg-success',
                    message: `The movie: ${req.body.title} was added to the database...`
                }
            }

            res.redirect('/admin')
        })
    })

    route.post('/admin/delete', (req, res) => {
        Movie.findByIdAndDelete(req.body.id).lean().then((doc) => {
            if (doc) {
                req.session.message = {
                    classes: 'text-white bg-success',
                    message: `Succesfully deleted "${doc.title}" from the database...`
                }
            } else {
                req.session.message = {
                    classes: 'text-white bg-danger',
                    message: `Can't deleted "${doc.title}" from the database...`
                }
            }

            Review.find({movie_id: doc._id.toString()}).lean().then((docs) => {
                let reviewPromises = []

                docs.forEach(doc => {
                    reviewPromises.push(new Promise((resolve, reject) => {
                        Comment.deleteMany({review_id: doc._id.toString()}).then(() => {
                            resolve()
                        })
                    }))

                    reviewPromises.push(new Promise((resolve, reject) => {
                        Users.updateMany({}, {
                            $pull: {
                                reviews: doc._id.toString()
                            }
                        }).then(() => {
                            resolve()
                        })
                    }))
                });

                Promise.all(reviewPromises).then(() => {
                    res.redirect('/admin')
                })
            })
        })
    })
    
    return route;
})()