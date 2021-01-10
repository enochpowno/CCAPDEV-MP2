module.exports = (function() {
    const route = require('express').Router()

    route.use('/', (req, res, next) => {
        next()
    })

    route.get('/', (req, res) => {
        res.render('index', {
            title: 'Movie Metro',
            layout: 'default',
            active: { home: true }
        })
    })

    route.get('/movies', (req, res) => {
        if (req.query.q) { // query was made, do some code for getting search

        }

        res.render('movies', {
            title: 'Movie Metro - Search',
            layout: 'default',
            active: { movies: true },
            style: ['movies'],
            script: ['movies']
        })
    })
    return route;
})()