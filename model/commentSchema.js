const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required']
    },

    comment: {
        type: String, 
        required: [true, 'Comment is required']
    },
    
    user_id: {
        type: String,
        required: [true, 'User ID is required']
    },

    review_id: {
        type: String,
        required: [true, 'Review ID is required']
    },

    date: {
        type: Date,
        default: () => Date.now
    }
})

module.exports = commentSchema