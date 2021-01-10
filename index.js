const path = require('path')
const hbs = require('express-hbs')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')

const app = express()

const port = process.env.PORT || 3000

// setup express server
app.use(bodyParser.urlencoded({ extended: true }))

// MS * S * M * H * D
app.use(cookieParser('movieMetroSecret', {
    maxAge: 1000 * 60 * 60 * 24 * 7 * 3 // 3 weeks
}))

app.use(expressSession({
    secret: 'movieMetroSecret',
    saveUninitialized: true,
    resave: false,
}))

app.use(express.static('public'))

app.engine('hbs', hbs.express4({
    partialsDir: path.join(__dirname, 'views', 'partials'),
    layoutsDir: path.join(__dirname, 'views', 'layouts')
}))

app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))

app.listen(port, () => {
    console.log(`Server started at port: ${port}`)
})

app.use('/', require('./routes')) // include routes