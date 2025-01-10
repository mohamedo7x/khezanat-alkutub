const bcrypt = require("bcryptjs");
const {param, body, check} = require("express-validator");

const ApiError = require("../utils/apiError");
const AdminModel = require("../models/adminModel");

exports.createAdminValidation = [
    body("name")
        .notEmpty()
        .withMessage("name must not be empty")
        .isLength({min: 3})
        .withMessage("name too short"),

    body("email")
        .notEmpty()
        .withMessage("email must not be empty")
        .isEmail()
        .withMessage("invalid email address")
        .custom((val, {req}) => AdminModel.findOne({email: val}).then((admin) => {
            if (admin) {
                return Promise.reject(new ApiError(req.__("emailUsed"), 400));
            }
        })),

    body("password")
        .notEmpty()
        .withMessage("password must not be empty")
        .isLength({min: 8})
        .withMessage("password too short, please enter password at least 8 characters")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#@$!%*?&]{8,}$/, "i")
        .withMessage("password must be have 8 or more characters, Upper & lower case letters, numbers, and at least one symbol like '!@#$%^&*'")
        .custom((password, {req}) => {
            const {passwordConfirm} = req.body

            if (password !== passwordConfirm) {
                return Promise.reject(new ApiError("password confirmation incorrect", 400));
            }
            return true;
        }),

    body("passwordConfirm")
        .notEmpty()
        .withMessage("password confirmation required"),

    body("phone")
        .notEmpty()
        .withMessage("phone must not be empty")
        .matches(/^\+\d{1,4}\d{8,12}$/)
        .withMessage("Invalid phone number. A valid phone number must start with a country code (1-4 digits) followed by 8-12 digits.\n For example, 201011511111 or 9660508222222.")
        .custom(async (val, {req}) => {
            const admin = await AdminModel.findOne({phone: val});

            if (admin) {
                return Promise.reject(new ApiError(req.__("noPhone"), 400));
            }
            return true;
        }),

    body("gender")
        .optional()
        .isIn(["male", "female"])
        .withMessage("gender must be male or female"),

    body("roles")
        .notEmpty()
        .withMessage("role must be controlAdmins, controlUsers, controlAuthor, controlCategory, controlProduct or controlOrder")
        .isIn(["controlAdmins", "controlUsers", "controlAuthor", "controlCategory", "controlProduct", "controlOrder", "controlApp"])
        .withMessage("role must be controlAdmins, controlUsers, controlCategory, controlProduct, controlApp or controlOrder"),
];

exports.loginValidator = [
    body("phone")
        .notEmpty()
        .withMessage("phone must not be empty")
        .matches(/^\+\d{1,4}\d{8,12}$/)
        .withMessage("Invalid phone number. A valid phone number must start with a country code (1-4 digits) followed by 8-12 digits.\n For example, 201011511111 or 9660508222222."),

    body("password")
        .notEmpty()
        .withMessage("password must not be empty")
        .isLength({min: 8})
        .withMessage("password too short, please enter password at least 8 characters")
        .custom(async (val, {req}) => {
            const admin = await AdminModel.findOne({phone: req.body.phone});

            if (!admin) {
                return Promise.reject(new ApiError(req.__("loginError"), 400));
            }

            const isPasswordCorrect = await bcrypt.compare(req.body.password, admin["password"]);

            if (!isPasswordCorrect) {
                return Promise.reject(new ApiError(req.__("loginError"), 400));
            }
            return true;
        }),
];

exports.getAdminValidation = [
    param("id")
        .isMongoId()
        .withMessage("invalid admin id")
        .custom(async (val) => {
            const admin = await AdminModel.findById(val);

            if (!admin) {
                return Promise.reject(new ApiError(`No admin found for this ID ${val}`, 404));
            }
            return true;
        }),
];

exports.searchValidation = [
    check("keyword").notEmpty().withMessage("keyword search must be not empty"),
];

exports.updateAdminValidation = [
    param("id")
        .isMongoId()
        .withMessage("invalid admin id")
        .custom(async (val) => {
            const admin = await AdminModel.findById(val);

            if (!admin) {
                return Promise.reject(new ApiError(`No admin found for this ID ${val}`, 404));
            }
            return true;
        }),

    body("name")
        .optional()
        .isLength({min: 3})
        .withMessage("name too short"),

    body("gender")
        .optional()
        .isIn(["male", "female"])
        .withMessage("gender must be male or female"),

    body("address")
        .optional(),

    body("email")
        .optional()
        .isEmail()
        .withMessage("invalid email address")
        .custom((val, {req}) => AdminModel.findOne({email: val}).then((admin) => {
            if (admin) {
                return Promise.reject(new ApiError(req.__("emailUsed"), 400));
            }
        })),

    body("roles")
        .optional()
        .isIn(["controlAdmins", "controlUsers", "controlAuthor", "controlCategory", "controlProduct", "controlOrder", "controlApp"])
        .withMessage("role must be controlAdmins, controlUsers, controlAuthor, controlCategory, controlProduct, controlOrder or controlApp"),
];

exports.deleteAdminValidation = [
    param("id")
        .isMongoId()
        .withMessage("invalid admin id")
        .custom(async (val) => {
            const admins = await AdminModel.find({roles: "controlAdmins"});

            if (admins.length <= 1) {
                return Promise.reject(new ApiError("not allow to delete admins, add new admin control admins and return to delete again", 404));
            }

            const admin = await AdminModel.findById(val);

            if (!admin) {
                return Promise.reject(new ApiError(`No admin found for this ID ${val}`, 404));
            }

            if (val === '677298493a632d107799150c') {
                return Promise.reject(new ApiError("this is main admin, not allow to delete this admin", 404));
            }

            return true;
        }),
];

exports.updateProfileValidation = [
    param("id")
        .isMongoId()
        .withMessage("invalid admin id")
        .custom(async (val) => {
            const admin = await AdminModel.findById(val);

            if (!admin) {
                return Promise.reject(new ApiError(`No admin found for this ID ${val}`, 404));
            }
            return true;
        }),

    body("name")
        .optional()
        .isLength({min: 3})
        .withMessage("name too short"),

    body("gender")
        .optional()
        .isIn(["male", "female"])
        .withMessage("gender must be male or female"),

    body("address")
        .optional(),

    body("email")
        .optional()
        .isEmail()
        .withMessage("invalid email address")
        .custom((val, {req}) => AdminModel.findOne({email: val}).then((admin) => {
            if (admin) {
                return Promise.reject(new ApiError(req.__("emailUsed"), 400));
            }
        })),
];

exports.changeAdminPasswordValidation = [
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

            const admin = await AdminModel.findById(req.loggedUser._id);

            const isCorrectPassword = await bcrypt.compare(currentPassword, admin["password"]);

            if (!isCorrectPassword) {
                return Promise.reject(new ApiError(req.__("currentPasswordError"), 400));
            }

            if (val !== confirmPassword) {
                return Promise.reject(new ApiError("please make sure passwords match", 400));
            }

            return true;
        }),

    body("confirmPassword")
        .notEmpty()
        .withMessage("confirmPassword must not be empty"),
];