const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required']
    },

    poster: {
        type: String,
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
        type: String,
        required: [true, 'Price is required']
    },

    status: {
        type: String,
        required: [true, 'Status is required']
    }
})

module.exports = movieSchema