const express = require("express");

const {
    uploadProductCoverImageAndPdfFile,
    resizeProductCoverImage,
    resizeProductPdfFile,
    createProduct,
    getProducts,
    getProductsWithWishlist,
    search,
    getProduct,
    getProductAdmin,
    getProductWithWishlist,
    updateProduct,
    deleteProduct,
    changeCoverImage,
    updatePdfFile,
    getAuthorProducts,
    rateProduct,
    setAuthorProfileID,
    getAuthorProductsWithWishlist,
} = require("../controllers/productController");
const {
    createProductValidation,
    checkProductValidation,
    searchValidation,
    updateProductValidation,
    deleteProductValidation,
} = require("../validations/productValidation")
const validationMiddleware = require("../middlewares/validationMiddleware");
const verifyToken = require("../middlewares/verifyToken");
const {allowedToAdmins, allowedToUser, allowedToAuthor, permissionValidate} = require("../middlewares/allowTo");

const router = express.Router();

router.get("/", getProducts);

router.get("/productsWithWishlist", verifyToken, allowedToUser(), permissionValidate, getProductsWithWishlist);

router.get("/search", searchValidation, validationMiddleware, search);

router.get("/authorProducts/:id", getAuthorProducts);

router.get("/productDetails/:productId", checkProductValidation, validationMiddleware, getProduct);

router.get("/authorMyProducts", verifyToken, allowedToAuthor(), permissionValidate, setAuthorProfileID, getAuthorProducts);

router.get("/withWishlist/:productId", verifyToken, allowedToUser(), permissionValidate, checkProductValidation, validationMiddleware, getProductWithWishlist);

router.get("/authorProductsWithWishlist/:id", verifyToken, allowedToUser(), permissionValidate, getAuthorProductsWithWishlist);

router.post("/rateProduct/:productId",
    verifyToken,
    allowedToUser(),
    permissionValidate,
    checkProductValidation,
    validationMiddleware,
    rateProduct,
);

router.use(verifyToken, allowedToAdmins("controlProduct"), permissionValidate);

router.get("/admin/:productId", checkProductValidation, validationMiddleware, getProductAdmin);

router.post("/",
    uploadProductCoverImageAndPdfFile,
    resizeProductCoverImage,
    resizeProductPdfFile,
    createProductValidation,
    validationMiddleware,
    createProduct,
);

router.route("/:productId")
    .patch(updateProductValidation, validationMiddleware, updateProduct)
    .delete(deleteProductValidation, validationMiddleware, deleteProduct);

router.patch("/changeCoverImage/:productId",
    uploadProductCoverImageAndPdfFile,
    resizeProductCoverImage,
    checkProductValidation,
    validationMiddleware,
    changeCoverImage,
);

router.patch("/changePDFFile/:productId",
    uploadProductCoverImageAndPdfFile,
    resizeProductPdfFile,
    checkProductValidation,
    validationMiddleware,
    updatePdfFile,
);

module.exports = router;