const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: "product",
    },
    comments: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref: "user",
            },
            comment: String,
            rate: Number,
            date: {
                type: Date,
                default: Date.now,
            },
        }
    ],
}, {timestamps: true});

commentSchema.pre(/^find/, function (next) {
    this.populate({path: "comments.user"});
    next();
});

const CommentModel = mongoose.model('comment', commentSchema);

module.exports = CommentModel;