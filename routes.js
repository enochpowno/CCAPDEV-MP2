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
        Movie.find({}, {}, {sort: {'date': -1}}).lean().exec(function (err, results) {
            let limit = 20
            
            res.render('index', {
                title: 'Movie Metro',
                layout: 'default',
                active: { home: true },
                results,
                user: req.session.user
            })
        })
    })

    route.get('/movies', (req, res) => {
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
            user: req.session.user
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
        res.render('login', {
            title: 'Movie Metro - Log In',
            layout: 'account',
            active: {login: true},
            user: req.session.user
        })
    })

    route.get('/logout', (req, res) => {
        delete req.session.user
        res.clearCookie('user')

        res.redirect('/')
    })

    route.post('/login', (req, res) => {
        console.log(req.body)
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
        res.render('register', {
            title: 'Movie Metro - Register',
            layout: 'account',
            active: {register: true}
        })
    })

    route.post('/register', (req, res) => {

    })
    return route;
})()