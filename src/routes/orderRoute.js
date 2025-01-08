const express = require("express");

const {
    createCashOrder,
    getMyOrders,
    getUserOrder,
    getOrders,
    getOrder,
    updateOrderState,
    updateOrderToPaid,
    updateOrderToDelivered,
    getAuthorOrders,
    createCheckout,
} = require("../controllers/orderController");
const {
    createOrderValidation,
    findOrderValidation,
} = require("../validations/orderValidation")
const validationMiddleware = require("../middlewares/validationMiddleware");
const verifyToken = require("../middlewares/verifyToken");
const {allowedToUser,allowedToAuthor, permissionValidate, allowedToAdmins} = require("../middlewares/allowTo");

const router = express.Router();

router.use(verifyToken);

router.get("/my", allowedToUser(), permissionValidate, getMyOrders);
router.get("/my/:orderId", allowedToUser(), permissionValidate, getUserOrder);

router.get("/author", allowedToAuthor(), permissionValidate, getAuthorOrders);

router.post("/cash/:cartId",
    allowedToUser(),
    permissionValidate,
    createOrderValidation,
    validationMiddleware,
    createCashOrder,
);

router.post("/checkout/:cartId",
    allowedToUser(),
    permissionValidate,
    createCheckout,
);

router.use(allowedToAdmins("controlOrder"))

router.get(
    "/:orderId",
    allowedToUser(),
    permissionValidate,
    findOrderValidation,
    validationMiddleware,
    getOrder,
);

router.use(permissionValidate)

router.get("/", getOrders)

router.patch("/:orderId/paid",
    findOrderValidation,
    validationMiddleware,
    updateOrderToPaid
);

router.patch("/:orderId/delivered",
    findOrderValidation,
    validationMiddleware,
    updateOrderToDelivered
);

router.patch("/:orderId/state",
    findOrderValidation,
    validationMiddleware,
    updateOrderState
);

module.exports = router;
