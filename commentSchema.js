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
    
    title: {
        type: String,
        required: [true, 'Title is required']
    },

    date: {
        type: Date,
        required: [true, 'Date is required']
    }
})

module.exports = commentSchema