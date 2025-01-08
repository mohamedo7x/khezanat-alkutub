const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    // required values
    title: {
        ar: {
            type: String,
            required: [true, "title ar is required"],
            trim: true,
            minLength: [3, "too short title ar of product"],
            maxLength: [200, "too long title ar of product"],
        },
        en: {
            type: String,
            required: [true, "title en is required"],
            trim: true,
            minLength: [3, "too short title en of product"],
            maxLength: [200, "too long title en of product"],
        },
        id: {
            type: String,
            required: [true, "title id is required"],
            trim: true,
            minLength: [3, "too short title id of product"],
            maxLength: [200, "too long title id of product"],
        },
        zh: {
            type: String,
            required: [true, "title zh is required"],
            trim: true,
            minLength: [3, "too short title zh of product"],
            maxLength: [200, "too long title zh of product"],
        },

    },
    description: {
        ar: {
            type: String,
            required: [true, "description ar is required"],
            minLength: [50, "too short description ar of product"],
            maxLength: [2000, "too long description ar of product"],
        },
        en: {
            type: String,
            required: [true, "description en is required"],
            minLength: [50, "too short description en of product"],
            maxLength: [2000, "too long description en of product"],
        },
        id: {
            type: String,
            required: [true, "description id is required"],
            minLength: [50, "too short description id of product"],
            maxLength: [2000, "too long description id of product"],
        },
        zh: {
            type: String,
            required: [true, "description zh is required"],
            minLength: [50, "too short description zh of product"],
            maxLength: [2000, "too long description zh of product"],
        },
    },
    category: {
        type: mongoose.Schema.ObjectId,
        ref: "category",
        required: [true, "category is required"],
    },
    coverImage: String,
    isAvailablePdf: {
        type: Boolean,
        required: [true, "please select pdf availability"],
    },
    isAvailablePaper: {
        type: Boolean,
        required: [true, "please select paper availability"],
    },
    pricePdf: Number,
    pricePaper:Number,
    stock: Number,

    // default values
    rate: {
        type: Number,
        default: 0.0,
    },
    rateCount: {
        type: Number,
        default: 0,
    },
    numberOfSalePdf: {
        type: Number,
        default: 0,
    },
    numberOfSalePaper: {
        type: Number,
        default: 0,
    },

    // optional values
    author: {
        type: mongoose.Schema.ObjectId,
        ref: "author",
    },
    pdfFile: String,
}, {timestamps: true});

productSchema.pre(/^find/, function (next) {
    this.populate({path: "category"});
    this.populate({path: "author"});
    next();
});

const ProductModel = mongoose.model("product", productSchema);

module.exports = ProductModel;