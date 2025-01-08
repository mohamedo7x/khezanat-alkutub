const mongoose = require('mongoose');

const requestBookSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: [true, "user is required"],
    },
    title: {
        type: String,
        required: [true, "title is required"],
        trim: true,
    },
    author: {
        type: String,
        required: [true, "author is required"],
        trim: true,
    },
    publisher: {
        type: String,
        required: [true, "publisher is required"],
        trim: true,
    },
    DateOfPublication: {
        type: String,
        required: [true, "date of publication is required"],
    },
    image: String,
}, {timestamps: true});

requestBookSchema.pre(/^find/, function (next) {
    this.populate({path: "user"});
    next();
});

const RequestBookModel = mongoose.model('requestBook', requestBookSchema);

module.exports = RequestBookModel;