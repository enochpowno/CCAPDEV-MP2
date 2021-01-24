const mongoose = require('mongoose')

const movieSchema = new mongoose.Schema({
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

    reviews: {
        type: Array,
        default: [String]
    },
    
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = movieSchema
