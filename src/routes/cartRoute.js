const express = require("express");

const {
    addProductToCart,
    getMyCart,
    deleteSpecificProductFromCart,
    clearCart
} = require("../controllers/cartController");
const {
    addProductToCartValidation,
    deleteSpecificProductFromCartValidation,
} = require("../validations/cartValidation")
const validationMiddleware = require("../middlewares/validationMiddleware");
const verifyToken = require("../middlewares/verifyToken");
const {allowedToUser, permissionValidate} = require("../middlewares/allowTo");

const router = express.Router();

router.use(verifyToken, allowedToUser(), permissionValidate);

router.route("/")
    .post(addProductToCartValidation, validationMiddleware, addProductToCart)
    .get(getMyCart)
    .delete(clearCart)

router.delete("/:productId",
    deleteSpecificProductFromCartValidation,
    validationMiddleware,
    deleteSpecificProductFromCart,
)

module.exports = router;