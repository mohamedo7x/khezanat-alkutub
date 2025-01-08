const fs = require('fs');
const path = require("path");

const sharp = require("sharp");

const asyncHandler = require("../middlewares/asyncHandler");
const {uploadSingleFile} = require("../middlewares/uploadFileMiddleware");
const {
    categoryData,
    allCategoryData,
    categoryDataNoLang,
    allCategoryDataNoLang
} = require("../utils/responseModelData");
const ApiError = require("../utils/apiError");
const apiSuccess = require("../utils/apiSuccess");
const CategoryModel = require("../models/categoryModel");

exports.uploadCategoryImage = uploadSingleFile("image");

exports.resizeCategoryImage = asyncHandler(async (req, res, next) => {
    const outputDir = path.join(__dirname, "../../uploads/categories");

    const fileName = `category-${Math.round(
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
                .toFile(`uploads/categories/${fileName}`);

            req.body.image = fileName;
        } catch (error) {
            return next(new ApiError(`Image processing failed: ${error.message}`, 500));
        }
    }
    next();
});

exports.createCategory = asyncHandler(async (req, res) => {
    await CategoryModel.create({
        title: {
            ar: req.body["arTitle"],
            en: req.body["enTitle"],
            id: req.body["idTitle"],
            zh: req.body["zhTitle"],
        },
        image: req.body.image,
    });

    return res.status(201).json(
        apiSuccess(
            res.__("successCreateCategory"),
            201,
            null,
        ));
});

exports.getCategories = asyncHandler(async (req, res) => {
    const categories = await CategoryModel.find();

    return res.status(200).json(
        apiSuccess(
            res.__("successGetAllCategories"),
            200,
            {categories: req.query.dashboard ? allCategoryDataNoLang(categories, req) : allCategoryData(categories, req)},
        ));
});

exports.search = asyncHandler(async (req, res) => {
    const {keyword} = req.query;

    const queryObj = {};
    queryObj.$or = [
        {title: {$regex: keyword, $options: "i"}},
    ]

    const categories = await CategoryModel.find(queryObj, "-__v");

    return res.status(200).json(
        apiSuccess(
            res.__("successGetAllCategories"),
            200,
            {categories: allCategoryData(categories, req)},
        ));
});

exports.getCategory = asyncHandler(async (req, res) => {
    const {id} = req.params;

    const category = await CategoryModel.findById(id);

    return res.status(200).json(
        apiSuccess(
            res.__("successGetCategory"),
            200,
            {category: req.query.dashboard ? categoryDataNoLang(category, req) : categoryData(category, req)},
        ));
});

exports.updateCategory = asyncHandler(async (req, res) => {
    const {id} = req.params;
    const {arTitle, enTitle, idTitle, zhTitle, image} = req.body;

    const category = await CategoryModel.findById(id);

    // Construct the update object
    const updateFields = {};
    if (arTitle || enTitle || idTitle || zhTitle) {
        updateFields.title = {
            ar: arTitle ?? category.title.ar,
            en: enTitle ?? category.title.en,
            id: idTitle ?? category.title.id,
            zh: zhTitle ?? category.title.zh,
        };
    }
    if (image) {
        updateFields.image = image;
    }

    // Update the category
    await CategoryModel.findByIdAndUpdate(id, updateFields, {
        new: true,
        runValidators: true,
    });

    // If a new image is provided, delete the old image
    if (image && category.image) {
        const oldImagePath = path.join(__dirname, "../../uploads/categories/", category.image);
        try {
            await fs.unlink(oldImagePath);
        } catch (err) {
            console.warn(`Warning: Unable to delete old image: ${oldImagePath}`);
        }
    }

    // Respond with success
    return res.status(200).json(apiSuccess(res.__("successUpdateCategory"), 200, null));

});

exports.deleteCategory = asyncHandler(async (req, res) => {
    const {id} = req.params;

    const category = await CategoryModel.findByIdAndDelete(id);

    if (category["image"]) {
        const filePath = path.join(__dirname, "../../uploads/categories/", category["image"]);
        await fs.unlinkSync(filePath);
    }

    return res.status(200).json(
        apiSuccess(
            res.__("successDeleteCategory"),
            200,
            null,
        ));
});