const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    title: {
        ar: {
            type: String,
            required: [true, "title ar is required"],
            trim: true,
        },
        en: {
            type: String,
            required: [true, "title en is required"],
            trim: true,
        },
        zh: {
            type: String,
            required: [true, "title zh is required"],
            trim: true,
        },
        id: {
            type: String,
            required: [true, "title id is required"],
            trim: true,
        },
    },
    image: {
        type: String,
        required: [true, "image is required"],
    }
}, {timestamps: true});

const CategoryModel = mongoose.model('category', categorySchema);

module.exports = CategoryModel;