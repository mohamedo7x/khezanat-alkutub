const {param, body} = require("express-validator");
const ApiError = require("../utils/apiError");
const CartModel = require("../models/cartModel");
const OrderModel = require("../models/orderModel");
const UserModel = require("../models/userModel");

exports.createOrderValidation = [
    param("cartId")
        .isMongoId()
        .withMessage("invalid cart id")
        .custom(async (val) => {
            const cart = await CartModel.findById(val);

            if (!cart) {
                return Promise.reject(new ApiError(`no cart found for this id ${val}`, 404));
            }
            return true;
        }),

    body("shippingAddress")
        .isMongoId()
        .withMessage("invalid address id")
        .custom(async (val, {req}) => {
            const user = await UserModel.findById(req.loggedUser._id);

            const address = user["addresses"].find((addr) =>
                addr._id.equals(val)
            );

            if (!address) {
                return Promise.reject(new ApiError(`no address found for this id ${val}`, 404));
            }

            return true;
        }),
];

exports.findOrderValidation = [
    param("orderId")
        .isMongoId()
        .withMessage("invalid order id")
        .custom(async (val) => {
            const order = await OrderModel.findById(val);

            if (!order) {
                return Promise.reject(new ApiError(`no order found for this id ${val}`, 404));
            }
            return true;
        }),
];

exports.updateOrderStateValidation = [
    param("orderId")
        .isMongoId()
        .withMessage("invalid order id"),

    body("state")
        .notEmpty()
        .withMessage("state order is required")
        .isIn(["confirmed", "shipped", "completed"])
        .withMessage("state order must be confirmed, shipped or completed")
        .custom(async (val, {req}) => {
            const order = await OrderModel.findById(req.params.orderId);

            if (!order) {
                return Promise.reject(new ApiError(`no order found for this id ${req.params.orderId}`, 404));
            }

            if (val === 'canceled' && order["paymentMethodType"] === 'card') {
                return Promise.reject(new ApiError('order payment method type is card, use refunded button', 400));
            }

            return true;
        })
];
