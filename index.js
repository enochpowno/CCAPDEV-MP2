const path = require('path')
const hbs = require('express-hbs')
const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const expressSession = require('express-session')

const app = express()

const port = process.env.PORT || 3000

function connect() {
    databaseUrl = "mongodb+srv://mp2_carreonpunovelascco:carreonpunovelasco@cluster0.dhmee.mongodb.net/MP2?retryWrites=true&w=majority"
    mongoose.connection
      .on('error', console.log)
      .on('disconnected', connect)
      .on('connected', () => console.log("Connected!"))

      return mongoose.connect(databaseUrl, {
          keepAlive: 1,
          useNewUrlParser: true,
          useUnifiedTopology: true
      });
}


// register handlebars conditional helper
hbs.registerHelper('iff', function (v1, operator, v2, options) {
    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
})

hbs.registerHelper('add', function (v1, v2, options) {
    return parseInt(v1) + parseInt(v2)
})

hbs.registerHelper('img', function (string) {
    let regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
    if (regexp.test(string)) {
        return string;
    } else {
        let string0 = string.buffer
        if (!string0) {
            string0 = string
        } else {
            string0 = string0.toString('base64')
        }

        return `data:image/png;base64,${string0}`
    }
})

hbs.registerHelper('datePrint', function (v1, options) {
    return v1.toLocaleDateString('en-US',  {year: 'numeric', month: '2-digit', day: '2-digit' })
})

// setup express server
app.use(bodyParser.urlencoded({ extended: false }))

// MS * S * M * H * D
app.use(cookieParser())

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
    console.log(`Attempting to connect to atlas...`)
    connect()
})

app.use('/', require('./routes')) // include routes