const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
    name: {
        ar: {
            type: String,
            required: [true, "ar name is required"],
            trim: true,
        },
        en: {
            type: String,
            required: [true, "en name is required"],
            trim: true,
        },
        id: {
            type: String,
            required: [true, "id name is required"],
            trim: true,
        },
        zh: {
            type: String,
            required: [true, "zh name is required"],
            trim: true,
        }
    },
    description: {
        ar: {
            type: String,
            required: [true, "ar description is required"],
            trim: true,
        },
        en: {
            type: String,
            required: [true, "en description is required"],
            trim: true,
        },
        id: {
            type: String,
            required: [true, "id description is required"],
            trim: true,
        },
        zh: {
            type: String,
            required: [true, "zh description is required"],
            trim: true,
        }
    },
    price: {
        type: Number,
        required: [true, "price is required"],
    },
    duration: {
        type: Number,
    },
    coupon: {
        type: Number,
        required: [true, "coupon is required"],
        min: 0,
        max: 100,
    },
    featureRole: [
        {
            type: String,
            enum: ["audioBook"],
        }
    ],
}, {timestamps: true});

const SubscriptionModel = mongoose.model('subscription', subscriptionSchema);

module.exports = SubscriptionModel;