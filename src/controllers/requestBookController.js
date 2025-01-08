const path = require("path");
const fs = require("fs");

const sharp = require("sharp");

const asyncHandler = require("../middlewares/asyncHandler");
const {uploadSingleFile} = require("../middlewares/uploadFileMiddleware");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const apiSuccess = require("../utils/apiSuccess");
const RequestBookModel = require("../models/requestBookModel");
const {allRequestBooksData} = require("../utils/responseModelData");

exports.uploadRequestBookImage = uploadSingleFile("image");

exports.resizeRequestBookImage = asyncHandler(async (req, res, next) => {
    const outputDir = path.join(__dirname, "../../uploads/requestBook");

    const fileName = `requestBook-${Math.round(
        Math.random() * 1e9
    )}-${Date.now()}.png`;

    if (req.file) {
        try {
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, {recursive: true});
            }

            await sharp(req.file.buffer)
                .toFormat("png")
                .png({quality: 90})
                .toFile(`uploads/requestBook/${fileName}`);

            req.body.image = fileName;
        } catch (error) {
            return next(new ApiError(`Image processing failed: ${error.message}`, 500));
        }
    }
    next();
});

exports.createRequestBook = asyncHandler(async (req, res) => {
    req.body.user = req.loggedUser._id;
    await RequestBookModel.create(req.body);

    return res.status(201).json(
        apiSuccess(
            res.__("successCreateRequestBook"),
            201,
            null,
        ));
});

exports.getRequestBooks = asyncHandler(async (req, res) => {
    const requestBookCount = await RequestBookModel.countDocuments();

    const apiFeatures = new ApiFeatures(RequestBookModel.find(), req.query)
        .paginate(requestBookCount)

    const {paginationResult, mongooseQuery} = apiFeatures;

    const requestBooks = await mongooseQuery;

    return res.status(200).json(
        apiSuccess(
            res.__("successGetRequestBooks"),
            200,
            {
                pagination: paginationResult,
                Books: allRequestBooksData(requestBooks, req),
            },
        ));
});

exports.removeRequestBook = asyncHandler(async (req, res) => {
    const {id} = req.params;

    const requestBook = await RequestBookModel.findByIdAndDelete(id);

    if (requestBook.image) {
        const filePath = path.join(__dirname, "../../uploads/requestBook/", requestBook["image"]);
        await fs.unlinkSync(filePath);
    }

    return res.status(200).json(
        apiSuccess(
            res.__("successRemoveRequestBook"),
            200,
            null,
        ));
});