const express = require('express');

const {
    getMyWishlist,
    addProductToWishlist,
    removeProductFromWishlist,
} = require('../controllers/authorWishlistController')
const {
    addProductToWishlistValidation,
    removeProductFromWishlistValidation,
} = require('../validations/authorWishlistValidation');
const validationMiddleware = require("../middlewares/validationMiddleware");
const verifyToken = require("../middlewares/verifyToken");
const {allowedToUser, permissionValidate} = require("../middlewares/allowTo")

const router = express.Router();

router.use(verifyToken, allowedToUser(), permissionValidate);

router.route("/")
    .get(getMyWishlist)
    .post(addProductToWishlistValidation, validationMiddleware, addProductToWishlist)
    .delete(removeProductFromWishlistValidation, validationMiddleware, removeProductFromWishlist)

module.exports = router;