const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
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
    totalCartPrice: Number,
    user: {
        type: mongoose.Schema.ObjectId,
        ref: "user"
    }
}, {timestamps: true});

cartSchema.pre(/^find/, function (next) {
    this.populate({
        path: "user",
    });

    this.populate({
        path: "cartItems.product",
    });

    next();
});

const CartModel = mongoose.model("cart", cartSchema);

module.exports = CartModel;