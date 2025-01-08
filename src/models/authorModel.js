const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"],
        trim: true,
    },
    bio: {
        type: String,
        required: [true, "bio is required"],
        minLength: [50, "too short bio"],
        maxLength: [500, "too long bio"],
    },
    password: {
        type: String,
        required: [true, "password is required"],
        minlength: [6, "too short password"],
    },
    phone: {
        type: String,
        required: [true, "phone is required"],
        unique: true,
    },
    profileImg: String,
    addresses: [
        {
            street: String,
            city: String,
            buildNumber: Number,
        },
    ],
    birthday: String,
    gender: {
        type: String,
        enum: ["male", "female"],
    },
    balance:{
        type: Number,
        default: 0,
    },
    wishlist: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "product",
        },
    ],
    haveBlock: {
        type: Boolean,
        default: false,
    },
    accountActivateCode: String,
    AccountActivateExpires: Date,
    accountActive: {
        type: Boolean,
        default: false,
    },
    passwordChangedAt: Date,
    passwordResetCode: String,
    passwordResetExpires: Date,
    passwordResetVerified: Boolean,
}, {timestamps: true});

const AuthorModel = mongoose.model('author', authorSchema);

module.exports = AuthorModel;