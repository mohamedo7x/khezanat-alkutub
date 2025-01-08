const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "user",
        required: [true, "order must belong to user"],
    },
    shippingAddress: {
        type: mongoose.Schema.ObjectId,
        ref: "user.addresses",
        required: [true, "address of order is not available"],
    },
    cartItems: [
        {
            product: {
                type: mongoose.Schema.ObjectId,
                ref: "product"
            },
            price: {
                type: Number,
            },
            isAvailablePdf: {
                type: Boolean,
            },
            isAvailablePaper: {
                type: Boolean,
            },
        }
    ],
    totalProductPrice: Number,
    shippingPrice: Number,
    totalOrderPrice: Number,
    currency: String,
    paymentMethodType: {
        type: String,
        enum: ["cash", "card"],
        default: "cash",
    },
    isPaid: {
        type: Boolean,
        default: false,
    },
    paidAt: Date,
    orderState: {
        type: String,
        enum: ["pending", "confirmed", "shipped", "completed", "canceled", "refunded"],
        default: "pending",
    },
    isDelivered: {
        type: Boolean,
        default: false,
    },
    deliveredAt: Date,
}, {timestamps: true});

orderSchema.pre(/^find/, function (next) {
    this.populate({
        path: "user",
    });

    this.populate({
        path: "cartItems.product",
    });

    next();
});

const OrderModel = mongoose.model("order", orderSchema);

module.exports = OrderModel;