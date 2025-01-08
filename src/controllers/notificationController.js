const asyncHandler = require("../middlewares/asyncHandler");
const {sendPushNotification} = require("../middlewares/sendNotification");
const {allNotificationsData} = require("../utils/responseModelData");
const apiSuccess = require("../utils/apiSuccess");
const ApiError = require("../utils/apiError");
const NotificationModel = require('../models/notificationModel');
const UserModel = require("../models/userModel");

exports.sendNotification = asyncHandler(async (req, res) => {
    const {user, title, content} = req.body;

    const notification = {
        title,
        content,
        isRead: false,
    };

    let userNotification = await NotificationModel.findOne({user});

    if (!userNotification) {
        userNotification = await NotificationModel.create(
            {
                user: user,
                notifications: [notification],
            },
        )
    } else {
        userNotification = await NotificationModel.findOneAndUpdate(
            {user},
            {$push: {notifications: notification}},
            {new: true, upsert: true},
        );
    }

    const userData = await UserModel.findById(userNotification.user);

    if (userData["deviceToken"]) {
        await sendPushNotification(title, content, userData["deviceToken"]);
    }

    return res.status(201).json(
        apiSuccess(
            "successSendNotification",
            201,
            null
        ));
});

exports.getUserNotifications = asyncHandler(async (req, res) => {
    const {userId} = req.params;

    const userNotifications = await NotificationModel.findOne({user: userId});

    return res.status(200).json(
        apiSuccess(
            "successGetUserNotifications",
            200,
            {
                userNotifications: allNotificationsData(userNotifications.notifications),
            }
        ));
});

exports.markNotificationAsRead = asyncHandler(async (req, res, next) => {
    const {userId} = req.params;
    const {notificationId} = req.body;

    const updatedNotification = await NotificationModel.findOneAndUpdate(
        {user: userId, 'notifications._id': notificationId},
        {$set: {'notifications.$.isRead': true}},
        {new: true}
    );

    if (!updatedNotification) {
        return next(new ApiError(`no notification found for this id ${notificationId}`, 404));
    }

    return res.status(200).json(
        apiSuccess(
            "successMarkNotificationAsRead",
            200,
            null,
        ));
});
