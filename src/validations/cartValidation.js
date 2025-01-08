const {param, body} = require("express-validator");

const ApiError = require("../utils/apiError");
const ProductModel = require("../models/productModel");

exports.addProductToCartValidation = [
    body("productId")
        .notEmpty()
        .withMessage("Product is required")
        .isMongoId()
        .withMessage("product id not valid")
        .custom(async (productId, {req}) => {
                const product = await ProductModel.findById(productId)
                if (!product) {
                    return Promise.reject(new ApiError(`${req.__("noProduct")} ${product}`, 404));
                }

                if (req.body.isAvailablePdf && req.body.isAvailablePaper) {
                    return Promise.reject(new ApiError("please select only value pdf or paper", 404));
                }

                if (req.body.isAvailablePdf && product["isAvailablePdf"] !== req.body.isAvailablePdf) {
                    return Promise.reject(new ApiError(req.__("unavailableProductPDF"), 404));
                }

                if (req.body.isAvailablePaper && product["isAvailablePaper"] !== req.body.isAvailablePaper) {
                    return Promise.reject(new ApiError(req.__("unavailableProductPaper"), 404));
                }

                return true;
            }
        ),

    body("isAvailablePdf")
        .notEmpty()
        .withMessage("please select pdf availability")
        .isBoolean()
        .withMessage("pdf availability is true or false"),

    body("isAvailablePaper")
        .notEmpty()
        .withMessage("please select paper availability")
        .isBoolean()
        .withMessage("paper availability is true or false"),
]

exports.deleteSpecificProductFromCartValidation = [
    param("productId")
        .isMongoId()
        .withMessage("Invalid Cart Id")
        .custom(async (val, {req}) => {
            const product = await ProductModel.findById(val);

            if (!product) {
                return Promise.reject(new ApiError(`${req.__("noProduct")} ${product}`, 404));
            }
            return true;
        }),
]