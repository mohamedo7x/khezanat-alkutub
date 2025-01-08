const crypto = require("crypto");

const bcrypt = require("bcryptjs");
const {body} = require("express-validator");

const ApiError = require("../utils/apiError");
const UserModel = require("../models/userModel");
const CategoryModel = require("../models/categoryModel");

exports.signupValidator = [
    body("name")
        .notEmpty()
        .withMessage("name must not be empty")
        .isLength({min: 3})
        .withMessage("name too short"),

    body("password")
        .notEmpty()
        .withMessage("password must not be empty")
        .isLength({min: 8})
        .withMessage("password too short, please enter password at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#@$!%*?&]{8,}$/, "i")
        .withMessage("password must be have 8 or more characters, Upper & lower case letters, numbers, and at least one symbol like '!@#$%^&*'")
        .custom((password, {req}) => {
            const {passwordConfirm} = req.body;

            if (password !== passwordConfirm) {
                return Promise.reject(new ApiError("password confirmation incorrect", 400))
            }
            return true;
        }),

    body("passwordConfirm")
        .notEmpty()
        .withMessage("password confirmation required"),

    body("phone")
        .notEmpty()
        .withMessage("phone must not be empty")
        .matches(/^5\d{8}$/)
        .withMessage("please enter valid phone")
        .custom(async (val, {req}) => {
            const user = await UserModel.findOne({phone: val});

            if (user) {
                return Promise.reject(new ApiError(req.__("phoneExists"), 400))
            }
            return true;
        }),

    body("birthday")
        .notEmpty()
        .withMessage("birthday must not be empty")
        .matches(/^\d{1,2}-\d{1,2}-\d{4}/)
        .withMessage("please enter valid date match as (dd-mm-yyyy)"),

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

    body("city")
        .optional(),
]

exports.verifyPhoneValidator = [
    body("phone")
        .notEmpty()
        .withMessage("phone must not be empty")
        .matches(/^5\d{8}$/)
        .withMessage("please enter valid phone"),

    body("activateCode")
        .notEmpty()
        .withMessage("activateCode must not be empty")
        .custom(async (val, {req}) => {
            const user = await UserModel.findOne({phone: req.body.phone});

            if (!user) {
                return Promise.reject(new ApiError(`${req.__("noPhone")} ${req.body.phone}`, 400));
            }

            if (val.length !== 4) {
                return Promise.reject(new ApiError(`activate code must be 4 characters long`, 400));
            }

            const hashedResetCode = crypto
                .createHash("sha256")
                .update(val)
                .digest("hex");

            if (user["accountActivateCode"] !== hashedResetCode || user["AccountActivateExpires"] <= Date.now()) {
                return Promise.reject(new ApiError(req.__("activationCodeError"), 400));
            }

            return true;
        }),
]

exports.loginValidator = [
    body("phone")
        .notEmpty()
        .withMessage("phone must not be empty")
        .matches(/^5\d{8}$/)
        .withMessage("please enter valid phone"),

    body("password")
        .notEmpty()
        .withMessage("password must not be empty")
        .isLength({min: 8})
        .withMessage("password too short, please enter password at least 8 characters")
        .custom(async (val, {req}) => {
            const user = await UserModel.findOne({phone: req.body.phone});
            const isPasswordCorrect = await bcrypt.compare(req.body.password, user["password"]);

            if (!user || !isPasswordCorrect) {
                return Promise.reject(new ApiError(req.__("loginError"), 400));
            }
            return true;
        }),
]

exports.phoneValidator = [
    body("phone")
        .notEmpty()
        .withMessage("phone must not be empty")
        .matches(/^5\d{8}$/)
        .withMessage("please enter valid phone")
        .custom(async (val, {req}) => {
            const user = await UserModel.findOne({phone: val});

            if (!user) {
                return Promise.reject(new ApiError(`${req.__("noPhone")} ${val}`, 400));
            }
            return true;
        }),
]

exports.verifyCodeValidator = [
    body("phone")
        .notEmpty()
        .withMessage("phone must not be empty")
        .matches(/^5\d{8}$/)
        .withMessage("please enter valid phone"),

    body("resetCode")
        .notEmpty()
        .withMessage("resetCode must not be empty")
        .custom(async (val, {req}) => {
            const user = await UserModel.findOne({phone: req.body.phone});
            if (!user) {
                return Promise.reject(new ApiError(`${req.__("noPhone")}  ${req.body.phone}`));
            }

            if (val.length !== 4) {
                return Promise.reject(new ApiError(`reset code must be 4 characters long`, 400));
            }

            const hashedResetCode = crypto
                .createHash("sha256")
                .update(val)
                .digest("hex");

            if (user["passwordResetCode"] !== hashedResetCode || user["passwordResetExpires"] <= Date.now()) {
                return Promise.reject(new ApiError(req.__("resetCodeError"), 400));
            }

            return true;
        }),
]

exports.resetPasswordValidator = [
    body("phone")
        .notEmpty()
        .withMessage("phone must not be empty")
        .matches(/^5\d{8}$/)
        .withMessage("please enter valid phone")
        .custom(async (val, {req}) => {
            const user = await UserModel.findOne({phone: val});
            if (!user) {
                return Promise.reject(new ApiError(`${req.__("noPhone")} ${val}`, 400));
            }

            if (!user["passwordResetVerified"]) {
                return Promise.reject(new ApiError(`reset code not verified`, 400));
            }

            return true;
        }),

    body("password")
        .notEmpty()
        .withMessage("password must not be empty")
        .isLength({min: 8})
        .withMessage("password too short, please enter password at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#@$!%*?&]{8,}$/, "i")
        .withMessage("password must be have 8 or more characters, Upper & lower case letters, numbers, and at least one symbol like '!@#$%^&*'")
        .custom((password, {req}) => {
            const {passwordConfirm} = req.body;

            if (password !== passwordConfirm) {
                return Promise.reject(new ApiError("password confirmation incorrect", 400))
            }

            return true;
        }),

    body("passwordConfirm").notEmpty()
        .withMessage("password confirmation required"),
]