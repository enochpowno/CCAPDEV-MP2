const mongoose = require('mongoose')

const reviewSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'username is required']
    },

    user_id: {
        type: String,
        required: [true, 'User ID is required']
    },

    title: {
        type: String,
        required: [true, 'Title is required']
    },

    movie_id: {
        type: String,
        required: [true, 'Movie ID is required']
    },
    
    review: {
        type: String,
        required: [true, 'Review is required']
    },

    comments: {
        type: Array,
        default: () => []
    },

    date: {
        type: Date,
        default: () => new Date()
    }
})

module.exports = reviewSchema
