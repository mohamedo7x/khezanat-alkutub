const {body, param, query} = require("express-validator");
const ApiError = require("../utils/apiError");
const CategoryModel = require("../models/categoryModel");
const ProductModel = require("../models/productModel");
const AuthorModel = require("../models/authorModel");
const CartModel = require("../models/cartModel");
const OrderModel = require("../models/orderModel");


const supportedLanguages = [
    'af', 'sq', 'ar', 'hy', 'ca', 'zh', 'zh-cn', 'zh-tw', 'zh-yue', 'hr', 'cs', 'da', 'nl', 
    'en', 'en-au', 'en-uk', 'en-us', 'eo', 'fi', 'fr', 'de', 'el', 'ht', 'hi', 'hu', 'is', 
    'id', 'it', 'ja', 'ko', 'la', 'lv', 'mk', 'no', 'pl', 'pt', 'pt-br', 'ro', 'ru', 'sr', 
    'sk', 'es', 'es-es', 'es-us', 'sw', 'sv', 'ta', 'th', 'tr', 'vi', 'cy'
];


exports.createProductValidation = [
    body("arTitle")
        .notEmpty()
        .withMessage("ar title of product must not be empty")
        .isLength({min: 3, max: 200})
        .withMessage("ar title must be at least 3 chars and at most 200 chars"),

    body("enTitle")
        .notEmpty()
        .withMessage("en title of product must not be empty")
        .isLength({min: 3, max: 200})
        .withMessage("en title must be at least 3 chars and at most 200 chars"),

    body("zhTitle")
        .notEmpty()
        .withMessage("zh title of product must not be empty")
        .isLength({min: 3, max: 200})
        .withMessage("zh title must be at least 3 chars and at most 200 chars"),

    body("idTitle")
        .notEmpty()
        .withMessage("id title of product must not be empty")
        .isLength({min: 3, max: 200})
        .withMessage("id title must be at least 3 chars and at most 200 chars"),

    body("arDescription")
        .notEmpty()
        .withMessage("ar description of product must not be empty")
        .isLength({min: 50, max: 2000})
        .withMessage("ar description must be at least 50 chars and at most 2000 chars"),

    body("enDescription")
        .notEmpty()
        .withMessage("en description of product must not be empty")
        .isLength({min: 50, max: 2000})
        .withMessage("en description must be at least 50 chars and at most 2000 chars"),

    body("idDescription")
        .notEmpty()
        .withMessage("id description of product must not be empty")
        .isLength({min: 50, max: 2000})
        .withMessage("id description must be at least 50 chars and at most 2000 chars"),

    body("zhDescription")
        .notEmpty()
        .withMessage("zh description of product must not be empty")
        .isLength({min: 50, max: 2000})
        .withMessage("zh description must be at least 50 chars and at most 2000 chars"),

    body("category")
        .notEmpty()
        .withMessage("Product must belong to category")
        .isMongoId()
        .withMessage("category id not valid")
        .custom(async (categoryId) => {
                const category = await CategoryModel.findById(categoryId);

                if (!category) {
                    return Promise.reject(new ApiError(`No category found for this ID ${categoryId}`, 404));
                }

                return true;
            }
        ),

    body("coverImage")
        .notEmpty()
        .withMessage("Product Image Cover is required"),

    body("isAvailablePdf")
        .notEmpty()
        .withMessage("please select pdf availability")
        .isBoolean()
        .withMessage("pdf availability is true or false")
        .custom((val, {req}) => {
            if (val && !req.body.pricePdf) {
                return Promise.reject(new ApiError(req.__("noPricePdf"), 400));
            }

            if (val && !req.body.pdfFile) {
                return Promise.reject(new ApiError(req.__("noPdfFile"), 400));
            }

            return true;
        }),

    body("isAvailablePaper")
        .notEmpty()
        .withMessage("please select paper availability")
        .isBoolean()
        .withMessage("paper availability is true or false")
        .custom((val, {req}) => {
            if (val === true) {
                if (!req.body.pricePaper) {
                    return Promise.reject(new ApiError(req.__("noPricePaper"), 400));
                }

                if (!req.body.stock) {
                    return Promise.reject(new ApiError('stock number not found', 400));
                }
            }

            return true;
        }),

    body("author")
        .optional()
        .isMongoId()
        .withMessage("author id not valid")
        .custom((authorId) =>
            AuthorModel.findById(authorId).then((author) => {
                if (!author) {
                    return Promise.reject(new ApiError(`No author for this ID ${authorId}`, 404));
                }
            })
        ),
    body('pdfLang')
        .notEmpty()
        .withMessage('Please enter the language of this PDF')
        .isIn(supportedLanguages)
        .withMessage('The provided language is not supported. Please provide a valid language code.'),
];

exports.checkProductValidation = [
    param("productId")
        .notEmpty()
        .withMessage("productId must be not empty")
        .isMongoId()
        .withMessage("Invalid product id")
        .custom(async (val, {req}) => {
            const product = await ProductModel.findById(val);

            if (!product) {
                return Promise.reject(new ApiError(`No product found for this ID ${val}`, 404));
            }
            return true;
        }),
];

exports.searchValidation = [
    query("keyword")
        .notEmpty()
        .withMessage("keyword search must be not empty"),
];

exports.updateProductValidation = [
    param("productId")
        .notEmpty()
        .withMessage("productId must be not empty")
        .isMongoId()
        .withMessage("Invalid product id")
        .custom(async (val) => {
            const product = await ProductModel.findById(val);

            if (!product) {
                return Promise.reject(new ApiError(`no product found for this id ${val}`, 404));
            }
            return true;
        }),

    body("arTitle")
        .optional()
        .isLength({min: 3, max: 200})
        .withMessage("ar title must be at least 3 chars and at most 200 chars"),

    body("enTitle")
        .optional()
        .isLength({min: 3, max: 200})
        .withMessage("en title must be at least 3 chars and at most 200 chars"),

    body("idTitle")
        .optional()
        .isLength({min: 3, max: 200})
        .withMessage("id title must be at least 3 chars and at most 200 chars"),

    body("zhTitle")
        .optional()
        .isLength({min: 3, max: 200})
        .withMessage("zh title must be at least 3 chars and at most 200 chars"),

    body("arDescription")
        .optional()
        .isLength({min: 50, max: 2000})
        .withMessage("ar description must be at least 50 chars and at most 2000 chars"),

    body("enDescription")
        .optional()
        .isLength({min: 50, max: 2000})
        .withMessage("en description must be at least 50 chars and at most 2000 chars"),

    body("idDescription")
        .optional()
        .isLength({min: 50, max: 2000})
        .withMessage("id description must be at least 50 chars and at most 2000 chars"),

    body("zhDescription")
        .optional()
        .isLength({min: 50, max: 2000})
        .withMessage("zh description must be at least 50 chars and at most 2000 chars"),

    body("pricePdf")
        .optional(),

    body("pricePaper")
        .optional(),

    body("category")
        .optional()
        .custom(async (categoryId) => {
                if (categoryId) {
                    const category = await CategoryModel.findById(categoryId);

                    if (!category) {
                        return Promise.reject(new ApiError(`No category found for this ID ${categoryId}`, 404));
                    }
                }

                return true;
            }
        ),

    body("author")
        .optional()
        .custom((authorId, {req}) =>
            AuthorModel.findById(authorId).then((author) => {
                if (!author) {
                    return Promise.reject(new ApiError(`No author found for this ID ${authorId}`, 404));
                }
            })
        ),

    body("isAvailablePdf")
        .optional()
        .isBoolean()
        .withMessage("pdf availability is true or false"),

    body("isAvailablePaper")
        .optional()
        .isBoolean()
        .withMessage("paper availability is true or false"),
];

exports.deleteProductValidation = [
    param("productId")
        .isMongoId()
        .withMessage("Invalid product id")
        .custom(async (val, {req}) => {
            const product = await ProductModel.findById(val);

            if (!product) {
                return Promise.reject(new ApiError(`no product found for this id ${val}`, 404));
            }

            const cart = await CartModel.findOne({"cartItems.product": val});
            const order = await OrderModel.findOne({"cartItems.product": val});

            if(cart || order){
                return Promise.reject(new ApiError(req.__("notAllowedProductDelete"), 404));
            }

            return true;
        }),
];