const {param, body, check} = require("express-validator");
const bcrypt = require("bcryptjs")

const ApiError = require("../utils/apiError");
const UserModel = require("../models/userModel");
const CategoryModel = require("../models/categoryModel");
const SubscriptionModel = require("../models/subscriptionModel");

exports.getUserValidation = [
    param("id")
        .isMongoId()
        .withMessage("invalid user id")
        .custom(async (val) => {
            const user = await UserModel.findById(val);

            if (!user) {
                return Promise.reject(new ApiError(`No user found for this ID ${val}`, 404));
            }
            return true;
        }),
];

exports.subscribeValidation = [
    param("subscriptionId")
        .isMongoId()
        .withMessage("invalid subscription id")
        .custom(async (val) => {
            const subscriptionPlan = await SubscriptionModel.findById(val);

            if (!subscriptionPlan) {
                return Promise.reject(new ApiError(`no subscription plan for this id ${val}`, 404));
            }

            if (val === '676a9a598d28c651357217c3') {
                return Promise.reject(new ApiError(`this is default subscription`, 400));
            }

            return true;
        }),
];

exports.updateUserValidation = [
    param("id")
        .isMongoId()
        .withMessage("invalid user id")
        .custom(async (val) => {
            const user = await UserModel.findById(val);

            if (!user) {
                return Promise.reject(new ApiError(`No user found for this ID ${val}`, 404));
            }
            return true;
        }),

    body("name")
        .optional()
        .isLength({min: 3})
        .withMessage("name too short"),

    body("birthday")
        .optional()
        .matches(/^\d{1,2}-\d{1,2}-\d{4}/)
        .withMessage("please enter valid date match as (dd-mm-yyyy)"),

    body("city")
        .optional(),

    body("gender")
        .optional()
        .isIn(["male", "female"])
        .withMessage("gender must be male or female"),

    body("interestedCategory")
        .custom(async (val) => {
            if (val) {
                for (const categoryId of val) {
                    const category = await CategoryModel.findById(categoryId);

                    if (!category) {
                        return Promise.reject(new ApiError(`no category for this id ${categoryId}`, 404));
                    }
                }
            }

            return true;
        }),
];

// exports.deleteUserValidation = [
//     param("id")
//         .isMongoId()
//         .withMessage("Invalid User Id")
//         .custom(async (val, {req}) => {
//             const user = await UserModel.findById(val);
//
//             if (!user) {
//                 return Promise.reject(new ApiError(`No user found for this ID ${val}`, 404));
//             }
//             return true;
//         }),
// ];

exports.blockUserValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid User Id")
        .custom(async (val) => {
            const user = await UserModel.findById(val);

            if (!user) {
                return Promise.reject(new ApiError(`No user found for this ID ${val}`, 404));
            }

            if(user.haveBlock === true){
                return Promise.reject(new ApiError(`this user already blocked`, 401));
            }

            return true;
        }),
];

exports.activeUserValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid User Id")
        .custom(async (val) => {
            const user = await UserModel.findById(val);

            if (!user) {
                return Promise.reject(new ApiError(`No user found for this ID ${val}`, 404));
            }

            if(user.haveBlock === false){
                return Promise.reject(new ApiError(`this user already activate`, 401));
            }

            return true;
        }),
];

exports.searchValidation = [
    check("keyword").notEmpty().withMessage("keyword search must be not empty"),
];

exports.addAddressValidation = [
    body("street")
        .notEmpty()
        .withMessage("street is required"),

    body("city")
        .notEmpty()
        .withMessage("latitude is required"),

    body("buildNumber")
        .notEmpty()
        .withMessage("longitude is required"),
];

exports.addressValidation = [
    param("addressId")
        .notEmpty()
        .withMessage("address id is required"),
];

exports.changeUserPasswordValidation = [
    body("currentPassword")
        .notEmpty()
        .withMessage("currentPassword must not be empty"),

    body("password")
        .notEmpty()
        .withMessage("password must not be empty")
        .isLength({min: 8})
        .withMessage("password too short, please enter password at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#@$!%*?&]{8,}$/, "i")
        .withMessage("password must be have 8 or more characters, Upper & lower case letters, numbers, and at least one symbol like '!@#$%^&*'")
        .custom(async (val, {req}) => {
            const {currentPassword, confirmPassword} = req.body;

            const user = await UserModel.findById(req.loggedUser._id);

            const isCorrectPassword = await bcrypt.compare(currentPassword, user["password"]);

            if (!isCorrectPassword) {
                return Promise.reject(new ApiError(req.__("currentPasswordError"), 400));
            }

            if (val !== confirmPassword) {
                return Promise.reject(new ApiError("Please make sure passwords match", 400));
            }

            return true;
        }),

    body("confirmPassword")
        .notEmpty()
        .withMessage("confirmPassword must not be empty"),
];