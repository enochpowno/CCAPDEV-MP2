const mongoose = require('mongoose')

const moviepostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required']
    },

    poster: {
        type: Buffer,
        required: [true, 'Poster is required']
    },

    synopsis: {
        type: String,
        required: [true, 'Synopsis is required']
    },

    upvote: {
        type: Number,
        required: [true, 'Likes are required']
    },

    downvote: {
        type: Number,
        required: [true, 'Dislikes are required']
    },

    price: {
        type: Number,
        required: [true, 'Price is required']
    },

    status: {
        type: String,
        required: [true, 'Status is required']
    },

    username1: {
        type: String,
        required: [true, 'Username is required']
    },

    review: {
        type: String,
        required: [true, 'Review is required']
    },

    username2: {
        type: String,
        required: [true, 'Username is required']
    },

    comment: {
        type: String, 
        required: [true, 'comment is required']
    },

    title: {
        type: String,
        required: [true, 'String is required']
    },

    date: {
        type: Date,
        required: true
    }

})

module.exports = moviepostSchema