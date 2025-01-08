const {param, body, check} = require("express-validator");

const ApiError = require("../utils/apiError");
const CategoryModel = require("../models/categoryModel");
const UserModel = require("../models/userModel");
const ProductModel = require("../models/productModel");

exports.createCategoryValidation = [
    body("arTitle")
        .notEmpty()
        .withMessage("ar title of category is required")
        .isLength({min: 3})
        .withMessage("Too short category name")
        .isLength({max: 100})
        .withMessage("Too long category name"),

    body("enTitle")
        .notEmpty()
        .withMessage("en title of category is required")
        .isLength({min: 3})
        .withMessage("Too short category name")
        .isLength({max: 100})
        .withMessage("Too long category name"),

    body("idTitle")
        .notEmpty()
        .withMessage("id title of category is required")
        .isLength({min: 3})
        .withMessage("Too short category name")
        .isLength({max: 100})
        .withMessage("Too long category name"),

    body("zhTitle")
        .notEmpty()
        .withMessage("zh title of category is required")
        .isLength({min: 3})
        .withMessage("Too short category name")
        .isLength({max: 100})
        .withMessage("Too long category name"),

    body("image")
        .notEmpty()
        .withMessage("category image is required"),
];

exports.getCategoryValidation = [
    param("id")
        .isMongoId()
        .withMessage("invalid category id")
        .custom(async (val) => {
            const category = await CategoryModel.findById(val);

            if (!category) {
                return Promise.reject(new ApiError(`no category for this id ${val}`, 404));
            }

            return true;
        }),
];

exports.updateCategoryValidation = [
    param("id")
        .isMongoId()
        .withMessage("invalid category id")
        .custom(async (val) => {
            const category = await CategoryModel.findById(val);

            if (!category) {
                return Promise.reject(new ApiError(`no category for this id ${val}`, 404));
            }
            return true;
        }),

    body("arTitle")
        .optional()
        .isLength({min: 3})
        .withMessage("Too short category name")
        .isLength({max: 100})
        .withMessage("Too long category name"),

    body("enTitle")
        .optional()
        .isLength({min: 3})
        .withMessage("Too short category name")
        .isLength({max: 100})
        .withMessage("Too long category name"),

    body("idTitle")
        .optional()
        .isLength({min: 3})
        .withMessage("Too short category name")
        .isLength({max: 100})
        .withMessage("Too long category name"),

    body("zhTitle")
        .optional()
        .isLength({min: 3})
        .withMessage("Too short category name")
        .isLength({max: 100})
        .withMessage("Too long category name"),

    body("image")
        .optional(),
];

exports.deleteCategoryValidation = [
    param("id")
        .isMongoId()
        .withMessage("invalid category id")
        .custom(async (val, {req}) => {
            const category = await CategoryModel.findById(val);

            if (!category) {
                return Promise.reject(new ApiError(`no category for this id ${val}`, 404));
            }
            const user = await UserModel.findOne({"interestedCategory": val});
            const product = await ProductModel.findOne({"category": val})

            if (user || product) {
                return Promise.reject(new ApiError(req.__("notAllowedCategoryDelete"), 400));
            }
            return true;
        }),
];

exports.searchValidation = [
    check("keyword").notEmpty().withMessage("keyword search must be not empty"),
];