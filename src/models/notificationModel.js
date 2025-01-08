const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: [true, "user is required"],
    },
    notifications: [
        {
            title: {
                type: String,
                trim: true,
            },
            content: {
                type: String,
                trim: true,
            },
            isRead: {
                type: Boolean,
                default: false,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            },
        }
    ],
}, {timestamps: true});

notificationSchema.pre(/^find/, function (next) {
    this.populate({path: "user"});
    next();
});

const NotificationModel = mongoose.model('notification', notificationSchema);

module.exports = NotificationModel;