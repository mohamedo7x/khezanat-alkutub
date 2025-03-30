const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "name is required"],
        trim: true,
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
            main: {
                type: Boolean,
                default: false,
            }
        },
    ],
    city: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "appControl.cities",
    },
    birthday: String,
    gender: {
        type: String,
        enum: ["male", "female"],
    },
    interestedCategory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "category",
        },
    ],
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
    subscription: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "subscription",
        default: '67a24c8b4c9399dd5c5f037d',
    },
    subscriptionBegan: Date,
    subscriptionEnd: Date,
    allowUnsubscribe: {
        type: Boolean,
        default: true,
    },
    deviceToken: String,
}, {timestamps: true});

userSchema.pre(/^find/, function (next) {
    this.populate("interestedCategory");
    this.populate("subscription");
    next();
});

const UserModel = mongoose.model('user', userSchema);

module.exports = UserModel;