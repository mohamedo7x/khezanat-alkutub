const {body} = require("express-validator");
const ApiError = require("../utils/apiError");
const ProductModel = require("../models/productModel")

exports.addProductToWishlistValidation = [
    body("productId")
        .notEmpty()
        .withMessage("product id is required")
        .isMongoId()
        .withMessage("product id not valid")
        .custom(async (val, {req}) => {
            const product = await ProductModel.findById(val);

            if (!product) {
                return Promise.reject(new ApiError(`No product found for this ID ${val}`, 404));
            }

            return true;
        }),
]

exports.removeProductFromWishlistValidation = [
    body("productId")
        .notEmpty()
        .withMessage("product id is required")
        .isMongoId()
        .withMessage("product id not valid")
        .custom(async (val, {req}) => {
            const product = await ProductModel.findById(val);

            if (!product) {
                return Promise.reject(new ApiError(`No product found for this ID ${val}`, 404));
            }

            return true;
        }),
]