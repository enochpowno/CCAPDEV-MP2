const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    fullname: {
        type: String,
        required: [true, 'Your full name is required']
    },

    username: {
        type: String,
        required: [true, 'Username is required']
    },

    password: {
        type: String,
        required: [true, 'Password is required']
    },

    email: {
        type: String,
        required: [true, 'Your email is required']
    },

    photo: {
        type: Buffer,
        required: [true, 'Profile photo is required']
    },

    reviews: {
        type: Array,
        default: [String]
    },

    type: {
        type: String,
        default: 'client'
    }
})

module.exports = userSchema