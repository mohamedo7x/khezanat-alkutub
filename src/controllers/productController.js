const fs = require('fs');
const path = require("path");
const {getDetailsOfPDF,convertTextToAudio,convertPdfToText} = require('../utils/oldAudioConvert');
const sharp = require("sharp");

const asyncHandler = require("../middlewares/asyncHandler");
const {uploadMixOfFile} = require("../middlewares/uploadFileMiddleware");
const {
    allProductData,
    productData,
    allProductWithWishlistData,
    productWithWishlistData,
    productDataNoLang
} = require("../utils/responseModelData");
const {deleteImageAfterValidationError} = require("../utils/deleteImageAfterValidationError");
const {getLocale} = require("../middlewares/setLocale");
const apiSuccess = require("../utils/apiSuccess");
const ApiFeatures = require("../utils/apiFeatures");
const ApiError = require("../utils/apiError");
const ProductModel = require("../models/productModel");
const UserModel = require("../models/userModel");
const CommentModel = require("../models/commentModel");
const AuthorModel = require("../models/authorModel");

exports.uploadProductCoverImageAndPdfFile = uploadMixOfFile([
    {name: "coverImage", maxCount: 1},
    {name: "pdfFile", maxCount: 1,},
]);

exports.resizeProductCoverImage = asyncHandler(async (req, res, next) => {
    if (req.files.coverImage) {
        const outputDir = path.join(__dirname, "../../uploads/products");
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, {recursive: true});
        }

        const fileName = `product-${Math.round(
            Math.random() * 1e9
        )}-${Date.now()}-cover.png`;

        try {
            await sharp(req.files.coverImage[0].buffer)
                .toFormat("png")
                .png({quality: 90})
                .toFile(`uploads/products/${fileName}`);

            req.body.coverImage = fileName;
        } catch (error) {
            return next(new ApiError(`Image processing failed: ${error.message}`, 500));
        }
    }

    next();
});

exports.resizeProductPdfFile = asyncHandler(async (req, res, next) => { 
    if (req.files.pdfFile) {
        const file = req.files.pdfFile;
        if (!file[0].mimetype.startsWith("application/pdf")) {
            await deleteImageAfterValidationError(req);
            return next(new ApiError(req.__("onlyPDF"), 400));
        }

        const outputDir = path.join(__dirname, "../../uploads/products/pdfs");
        const outputDirAudio = path.join(__dirname, "../../uploads/products/audio");
        
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, {recursive: true});
        }

        if (!fs.existsSync(outputDirAudio)) {
            fs.mkdirSync(outputDirAudio, {recursive: true});
        }

        const fileName = `product-${Math.round(Math.random() * 1e9)}-${Date.now()}-pdf.pdf`;
        const pdfAudio = `product-${Math.round(Math.random() * 1e9)}-${Date.now()}-audio.mp3`;

        try {
            const pdfFilePath = path.join(outputDir, fileName);
            const pdfAudioPath = path.join(outputDirAudio, pdfAudio);

            fs.writeFile(pdfFilePath, req.files.pdfFile[0].buffer, (err) => {
                if (err) return next(new ApiError(`Error writing PDF file: ${err.message}`, 500));
            });
            if(req.body.audio.toString() === 'true'){
                const textOfPdf = await convertPdfToText(req.files.pdfFile[0].buffer);
                convertTextToAudio(textOfPdf ,req.body.pdfLang ,pdfAudioPath , fileName , pdfAudio);
            }
            req.body.pdfFile = fileName;
            // req.body.pdfAudioFile = pdfAudio;
        } catch (error) {
            return next(new ApiError(`PDF processing failed: ${error.message}`, 500));
        }
    }

    next();
});

exports.createProduct = asyncHandler(async (req, res) => {
    await ProductModel.create({
        title: {
            ar: req.body["arTitle"],
            en: req.body["enTitle"],
            id: req.body["idTitle"],
            zh: req.body["zhTitle"],
        },
        description: {
            ar: req.body["arDescription"],
            en: req.body["enDescription"],
            zh: req.body["zhDescription"],
            id: req.body["idDescription"],
        },
        category: req.body.category,
        coverImage: req.body.coverImage,
        pdfFile: req.body.pdfFile,
        author: req.body.author,
        isAvailablePdf: req.body.isAvailablePdf,
        isAvailablePaper: req.body.isAvailablePaper,
        pricePdf: req.body.pricePdf,
        pricePaper: req.body.pricePaper,
        stock: req.body.stock,
        pdfAudio:'temp'
    });

    return res.status(201).json(
        apiSuccess(
            res.__("successCreateProduct"),
            201,
            null,
        ));
});

exports.getProducts = asyncHandler(async (req, res) => {
    const queryStringObj = {...req.query}
    const excludesFields = ["page", "limit", "sort", "fields", "keyword"];
    excludesFields.forEach(field => delete queryStringObj[field]);

    let queryStr = JSON.stringify(queryStringObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    const productsCount = await ProductModel.countDocuments(JSON.parse(queryStr));

    const apiFeatures = new ApiFeatures(ProductModel.find(), req.query)
        .paginate(productsCount)
        .filter()
        .sort()

    const {paginationResult, mongooseQuery} = apiFeatures;

    const products = await mongooseQuery;

    return res.status(200).json(
        apiSuccess(
            res.__("successGetProducts"),
            200,
            {
                pagination: paginationResult,
                products: allProductData(products, req),
            }
        ));
});

exports.getProductsWithWishlist = asyncHandler(async (req, res) => {
    const productsCount = await ProductModel.countDocuments();
    const user = await UserModel.findById(req.loggedUser._id, 'wishlist').populate("wishlist");

    const apiFeatures = new ApiFeatures(ProductModel.find(), req.query)
        .paginate(productsCount)
        .filter()
        .sort()

    const {paginationResult, mongooseQuery} = apiFeatures;

    const products = await mongooseQuery;

    return res.status(200).json(
        apiSuccess(
            res.__("successGetProducts"),
            200,
            {
                pagination: paginationResult,
                products: allProductWithWishlistData(products, user["wishlist"], req),
            }
        ));
});

exports.search = asyncHandler(async (req, res) => {
    const {keyword} = req.query;

    const queryObj = {};
    queryObj.$or = [
        {[`title.${getLocale(req)}`]: {$regex: keyword, $options: "i"}},
        {[`description.${getLocale(req)}`]: {$regex: keyword, $options: "i"}},
    ]

    const productsCount = await ProductModel.countDocuments(queryObj);

    const apiFeatures = new ApiFeatures(ProductModel.find(queryObj), req.query)
        .paginate(productsCount)
        .filter()
        .sort()

    const {paginationResult, mongooseQuery} = apiFeatures;

    const products = await mongooseQuery;

    return res.status(200).json(
        apiSuccess(
            res.__("successGetProducts"),
            200,
            {
                pagination: paginationResult,
                products: allProductData(products, req)
            }
        ));
});

exports.getProduct = asyncHandler(async (req, res) => {
    const {productId} = req.params;

    const product = await ProductModel.findById(productId);
    const productComment = await CommentModel.findOne({product: productId})

    let comments = []
    if (productComment) {
        comments = productComment.comments
    }

    return res.status(200).json(
        apiSuccess(
            res.__("successGetProduct"),
            200,
            {product: productData(product, comments, req)},
        ));
});

exports.getProductAdmin = asyncHandler(async (req, res) => {
    const {productId} = req.params;

    const product = await ProductModel.findById(productId);
    const productComment = await CommentModel.findOne({product: productId})

    let comments = []
    if (productComment) {
        comments = productComment.comments
    }

    return res.status(200).json(
        apiSuccess(
            res.__("successGetProduct"),
            200,
            {product: productDataNoLang(product, comments, req)},
        ));
});

exports.getProductWithWishlist = asyncHandler(async (req, res) => {
    const {productId} = req.params;

    const product = await ProductModel.findById(productId);
    const productComment = await CommentModel.findOne({product: productId})
    const user = await UserModel.findById(req.loggedUser._id, 'wishlist').populate("wishlist");

    let comments = []
    if (productComment) {
        comments = productComment.comments
    }

    const exists = user['wishlist'].some((product) => product._id.toString() === productId);

    return res.status(200).json(
        apiSuccess(
            res.__("successGetProduct"),
            200,
            {product: productWithWishlistData(product, comments, exists, req)},
        ));
});

exports.updateProduct = asyncHandler(async (req, res) => {
    const {productId} = req.params;

    const product = await ProductModel.findById(productId);

    const updateFields = {
        title: {
            ar: req.body.arTitle ?? product.title.ar,
            en: req.body.enTitle ?? product.title.en,
            id: req.body.idTitle ?? product.title.id,
            zh: req.body.zhTitle ?? product.title.zh,
        },
        description: {
            ar: req.body.arDescription ?? product.description.ar,
            en: req.body.enDescription ?? product.description.en,
            id: req.body.idDescription ?? product.description.id,
            zh: req.body.zhDescription ?? product.description.zh,
        },
        isAvailablePdf: req.body.isAvailablePdf ?? product.isAvailablePdf,
        isAvailablePaper: req.body.isAvailablePaper ?? product.isAvailablePaper,
        category: req.body.category ?? product.category,
        author: req.body.author ?? product.author,
        pricePdf: req.body.pricePdf ?? product.pricePdf,
        pricePaper: req.body.pricePaper ?? product.pricePaper,
        stock: req.body.stock ?? product.stock,
    };

    await ProductModel.findByIdAndUpdate(productId, updateFields, {
        new: true,
        runValidators: true,
    });

    return res.status(200).json(
        apiSuccess(
            res.__("successUpdateProduct"),
            200,
            null
        ));
});

exports.deleteProduct = asyncHandler(async (req, res) => {
    const {productId} = req.params;

    const product = await ProductModel.findByIdAndDelete(productId);

    if (product["coverImage"]) {
        const coverImagePath = path.join(__dirname, "../../uploads/products/", product["coverImage"]);
        await fs.unlinkSync(coverImagePath);
    }

    if (product["pdfFile"]) {
        const pdfFilePath = path.join(__dirname, "../../uploads/products/pdfs/", product["pdfFile"]);
        await fs.unlinkSync(pdfFilePath);
    }

    await CommentModel.findOneAndDelete({product: productId});

    const users = await UserModel.find({'wishlist': productId});
    for (const user of users) {
        await UserModel.findByIdAndUpdate(user._id, {$pull: {wishlist: productId}});
    }

    const authors = await AuthorModel.find({'wishlist': productId});
    for (const author of authors) {
        await AuthorModel.findByIdAndUpdate(author._id, {$pull: {wishlist: productId}});
    }

    return res.status(200).json(
        apiSuccess(
            res.__("successDeleteProduct"),
            200,
            null,
        ));
});

exports.changeCoverImage = asyncHandler(async (req, res) => {
    const {coverImage} = req.body;
    const {productId} = req.params;

    const product = await ProductModel.findByIdAndUpdate(productId, {coverImage});

    if (product["coverImage"]) {
        const filePath = path.join(__dirname, "../../uploads/products/", product["coverImage"]);
        await fs.unlinkSync(filePath);
    }

    return res.status(200).json(
        apiSuccess(
            res.__("successChangeCoverImage"),
            200,
            null,
        ));
});

exports.updatePdfFile = asyncHandler(async (req, res) => {
    const {pdfFile} = req.body;
    const {productId} = req.params;

    const product = await ProductModel.findByIdAndUpdate(productId, {pdfFile});

    if (product["pdfFile"]) {
        const pdfFilePath = path.join(__dirname, "../../uploads/products/pdfs/", product["pdfFile"]);
        await fs.unlinkSync(pdfFilePath);
    }

    return res.status(200).json(
        apiSuccess(
            res.__("successChangePDFFile"),
            200,
            null,
        ));
});

exports.setAuthorProfileID = asyncHandler(async (req, res, next) => {
    req.params.id = req.loggedUser._id;
    next();
});

exports.getAuthorProducts = asyncHandler(async (req, res) => {
    const {id} = req.params;

    const productsCount = await ProductModel.countDocuments({author: id});

    const apiFeatures = new ApiFeatures(ProductModel.find({author: id}), req.query)
        .paginate(productsCount)
        .filter()
        .sort()

    const {paginationResult, mongooseQuery} = apiFeatures;

    const products = await mongooseQuery;

    return res.status(200).json(
        apiSuccess(
            res.__("successGetAuthorProducts"),
            200,
            {
                pagination: paginationResult,
                products: allProductData(products, req),
            }
        ));
});

exports.getAuthorProductsWithWishlist = asyncHandler(async (req, res) => {
    const {id} = req.params;

    const productsCount = await ProductModel.countDocuments({author: id});
    const user = await UserModel.findById(req.loggedUser._id, 'wishlist').populate("wishlist");

    const apiFeatures = new ApiFeatures(ProductModel.find({author: id}), req.query)
        .paginate(productsCount)
        .filter()
        .sort()

    const {paginationResult, mongooseQuery} = apiFeatures;

    const products = await mongooseQuery;

    return res.status(200).json(
        apiSuccess(
            res.__("successGetAuthorProducts"),
            200,
            {
                pagination: paginationResult,
                products: allProductWithWishlistData(products, user["wishlist"], req),
            }
        ));
});

exports.rateProduct = asyncHandler(async (req, res) => {
    const {productId} = req.params;
    const {rating, comment} = req.body;

    const product = await ProductModel.findById(productId);
    product.rate = ((product.rate * product["rateCount"]) + rating) / (product["rateCount"] + 1);
    product.rateCount = Number(product.rateCount) + 1;
    await product.save();

    const productComment = await CommentModel.findOne({product: productId});

    if (productComment) {
        await CommentModel.findOneAndUpdate({product: productId}, {
            $addToSet: {
                "comments": {
                    user: req.loggedUser._id,
                    comment: comment,
                    rate: rating,
                }
            }
        });
    } else {
        await CommentModel.create({
            product: productId,
            comments: [{
                user: req.loggedUser._id,
                comment: comment,
                rate: rating,
            }]
        });
    }

    return res.status(200).json(
        apiSuccess(
            res.__("successRateProduct"),
            200,
            null,
        ));
});