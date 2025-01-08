const {body, param} = require("express-validator");

const ApiError = require("../utils/apiError");
const UserModel = require("../models/userModel");

exports.sendNotificationValidator = [
    body('user')
        .isMongoId()
        .withMessage('Invalid user ID')
        .custom(async (val) => {
            const user = await UserModel.findById(val);

            if(!user){
                return Promise.reject(new ApiError(`no user found for this id ${val}`, 404));
            }

            return true;
        }),

    body('title')
        .notEmpty()
        .withMessage('Title is required'),

    body('content')
        .notEmpty()
        .withMessage('Content is required'),
];

exports.getNotificationsValidator = [
    param('userId')
        .isMongoId()
        .withMessage('Invalid user ID'),
];

exports.markNotificationAsReadValidator = [
    param('userId')
        .isMongoId()
        .withMessage('Invalid user ID')
        .custom(async (val) => {
            const user = await UserModel.findById(val);

            if(!user){
                return Promise.reject(new ApiError(`no user found for this id ${val}`, 404));
            }

            return true;
        }),

    body('notificationId')
        .isMongoId()
        .withMessage('Invalid notification ID'),
];