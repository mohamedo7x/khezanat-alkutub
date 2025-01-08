const {param, body} = require("express-validator");

const ApiError = require("../utils/apiError");
const RequestBookModel = require("../models/requestBookModel");

exports.createRequestBookValidation = [
    body("title")
        .notEmpty()
        .withMessage("title of request book is required")
        .isLength({min: 3})
        .withMessage("Too short request book title")
        .isLength({max: 32})
        .withMessage("Too long request book title"),

    body("author")
        .notEmpty()
        .withMessage("author of request book is required"),

    body("publisher")
        .notEmpty()
        .withMessage("publisher of request book is required"),

    body("DateOfPublication")
        .notEmpty()
        .withMessage("Date Of Publication request book is required")
        .isLength({min: 4 ,max: 4})
        .withMessage("Year Of Publication request book not valid"),

    body("image")
        .optional(),
];

exports.removeRequestBookValidation = [
    param("id")
        .isMongoId()
        .withMessage("invalid book id")
        .custom(async (val) => {
            const requestBook = await RequestBookModel.findById(val);

            if (!requestBook) {
                return Promise.reject(new ApiError(`no request book for this id ${val}`, 404));
            }
            return true;
        }),
];