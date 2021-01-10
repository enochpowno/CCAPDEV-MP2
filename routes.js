const mongoose = require('mongoose')

const movieSchema = require('./model/movieSchema.js')
const Movie = mongoose.model('movie', movieSchema, 'movie')

const userSchema = require('./model/userSchema.js')
const Users = mongoose.model('user', userSchema, 'user')

module.exports = (function() {
    const route = require('express').Router()

    route.use('/', (req, res, next) => {
        if (!req.session.user) {
            if (req.cookies["user"]) {
                req.session.user = req.cookies["user"]
            }
        }

        next()
    })

    route.get('/', (req, res) => {
        let message = null
        if (req.session.message) {
            message = {...req.session.message}
            delete req.session.message
        }

        Movie.find({}, {}, {sort: {'date': -1}}).lean().exec(function (err, results) {
            let limit = 20
            
            res.render('index', {
                title: 'Movie Metro',
                layout: 'default',
                active: { home: true },
                results,
                user: req.session.user,
                message: message
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

    route.get('/logout', (req, res) => {
        delete req.session.user
        res.clearCookie('user')

        res.redirect('/')
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
                            res.cookie('user', doc)
                        }

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

    return route;
})()