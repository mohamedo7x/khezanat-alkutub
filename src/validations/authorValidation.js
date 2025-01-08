const {param, body, check} = require("express-validator");
const bcrypt = require("bcryptjs")

const ApiError = require("../utils/apiError");
const AuthorModel = require("../models/authorModel");
const CreateAuthorFormModel = require("../models/createAuthorFormModel");

exports.getAuthorValidation = [
    param("id")
        .isMongoId()
        .withMessage("invalid author id")
        .custom(async (val) => {
            const author = await AuthorModel.findById(val);

            if (!author) {
                return Promise.reject(new ApiError(`No author found for this ID ${val}`, 404));
            }
            return true;
        }),
];

exports.updateAuthorValidation = [
    param("id")
        .isMongoId()
        .withMessage("invalid author id")
        .custom(async (val) => {
            const author = await AuthorModel.findById(val);

            if (!author) {
                return Promise.reject(new ApiError(`No author found for this ID ${val}`, 404));
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
];

// exports.deleteAuthorValidation = [
//     param("id")
//         .isMongoId()
//         .withMessage("Invalid Author Id")
//         .custom(async (val, {req}) => {
//             const author = await AuthorModel.findById(val);
//
//             if (!author) {
//                 return Promise.reject(new ApiError(`No author found for this ID ${val}`, 404));
//             }
//             return true;
//         }),
// ];

exports.blockAuthorValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid Author Id")
        .custom(async (val) => {
            const author = await AuthorModel.findById(val);

            if (!author) {
                return Promise.reject(new ApiError(`No author found for this ID ${val}`, 404));
            }

            if(author.haveBlock === true){
                return Promise.reject(new ApiError(`this author already blocked`, 401));
            }

            return true;
        }),
];

exports.activeAuthorValidation = [
    param("id")
        .isMongoId()
        .withMessage("Invalid Author Id")
        .custom(async (val) => {
            const author = await AuthorModel.findById(val);

            if (!author) {
                return Promise.reject(new ApiError(`No author found for this ID ${val}`, 404));
            }

            if(author.haveBlock === false){
                return Promise.reject(new ApiError(`this author already activate`, 401));
            }

            return true;
        }),
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

exports.removeAddressValidation = [
    param("addressId")
        .notEmpty()
        .withMessage("address id is required"),
];

exports.changeAuthorPasswordValidation = [
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

            const author = await AuthorModel.findById(req.loggedUser._id);

            const isCorrectPassword = await bcrypt.compare(currentPassword, author["password"]);

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

exports.searchValidation = [
    check("keyword").notEmpty().withMessage("keyword search must be not empty"),
];

exports.formCreateAuthorValidator = [
    body("name")
        .notEmpty()
        .withMessage("name must not be empty")
        .isLength({min: 3})
        .withMessage("name too short"),

    body("bio")
        .notEmpty()
        .withMessage("name must not be empty")
        .isLength({min: 50, max: 500})
        .withMessage("bio range must be between 50 and 500 characters"),

    body("phone")
        .notEmpty()
        .withMessage("phone must not be empty")
        .matches(/^\d{1,4}\d{8,12}$/)
        .withMessage("Invalid phone number. A valid phone number must start with a country code (1-4 digits) followed by 8-12 digits.\n For example, 201011511111 or 9660508222222."),

    body("birthday")
        .notEmpty()
        .withMessage("birthday must not be empty")
        .matches(/^\d{1,2}-\d{1,2}-\d{4}/)
        .withMessage("please enter valid date match as (dd-mm-yyyy)"),

    body("profileImg")
        .notEmpty()
        .withMessage("profile Image is required"),

    body("gender")
        .optional()
        .isIn(["male", "female"])
        .withMessage("gender must be male or female"),
];

exports.confirmCreateAuthorValidation = [
    param("id")
        .isMongoId()
        .withMessage("invalid author id")
        .custom(async (val) => {
            const author = await CreateAuthorFormModel.findById(val);

            if (!author) {
                return Promise.reject(new ApiError(`No author found for this ID ${val}`, 404));
            }
            return true;
        }),
];

exports.createNewAuthorValidator = [
    body("name")
        .notEmpty()
        .withMessage("name must not be empty")
        .isLength({min: 3})
        .withMessage("name too short"),

    body("bio")
        .notEmpty()
        .withMessage("bio must not be empty"),

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
        .matches(/^\d{1,4}\d{8,12}$/)
        .withMessage("Invalid phone number. A valid phone number must start with a country code (1-4 digits) followed by 8-12 digits.\n For example, 201011511111 or 9660508222222."),

    body("birthday")
        .notEmpty()
        .withMessage("birthday must not be empty")
        .matches(/^\d{1,2}-\d{1,2}-\d{4}/)
        .withMessage("please enter valid date match as (dd-mm-yyyy)"),

    body("gender")
        .optional()
        .isIn(["male", "female"])
        .withMessage("gender must be male or female"),
]