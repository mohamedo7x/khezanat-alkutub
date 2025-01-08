const express = require("express");

const {
    uploadCategoryImage,
    resizeCategoryImage,
    // uploadToHost,
    createCategory,
    getCategories,
    getCategory,
    search,
    updateCategory,
    deleteCategory,
} = require("../controllers/categoryController");
const {
    createCategoryValidation,
    getCategoryValidation,
    searchValidation,
    updateCategoryValidation,
    deleteCategoryValidation
} = require("../validations/categoryValidation")
const validationMiddleware = require("../middlewares/validationMiddleware");
const verifyToken = require("../middlewares/verifyToken");
const {allowedToAdmins, allowedToUser, permissionValidate} = require("../middlewares/allowTo");

const router = express.Router();

router.get("/", getCategories);

router.use(verifyToken, allowedToAdmins("controlCategory"));

router.post("/", permissionValidate, uploadCategoryImage, resizeCategoryImage, createCategoryValidation, validationMiddleware, createCategory)

router.get("/search", permissionValidate, searchValidation, validationMiddleware, search)

router.route("/:id")
    .get(permissionValidate, getCategoryValidation, validationMiddleware, getCategory)
    .patch(permissionValidate, uploadCategoryImage, resizeCategoryImage, updateCategoryValidation, validationMiddleware, updateCategory)
    .delete(permissionValidate, deleteCategoryValidation, validationMiddleware, deleteCategory)

module.exports = router;