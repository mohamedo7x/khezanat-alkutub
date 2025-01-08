const asyncHandler = require("../middlewares/asyncHandler");

const {cartData} = require("../utils/responseModelData");
const apiSuccess = require("../utils/apiSuccess");
const CartModel = require("../models/cartModel");
const ProductModel = require("../models/productModel");
const UserModel = require("../models/userModel");
const AppControlModel = require("../models/appControlModel");

const calculateTotalCartPrice = (cart) => {
    let totalPrice = 0;
    cart.cartItems.forEach(item => {
        totalPrice += Number(item.price);
    });

    cart.totalProductPrice = Number(totalPrice);
    cart.totalCartPrice = Number(totalPrice) + Number(cart.shippingPrice);
}

const checkSubscription = async (userId, price) => {
    const user = await UserModel.findById(userId);
    const couponDiscount = user.subscription.coupon;

    if (couponDiscount > 0) {
        return Number(price) - ((Number(price) * Number(couponDiscount)) / 100);
    }
    return price;
}

const getSippingPrice = async (userId) => {
    const user = await UserModel.findById(userId);
    const appControl = await AppControlModel.findOne({app: "khezanatalkutub"});

    const city = appControl["cities"].find((city) =>
        city._id.equals(user.city)
    );

    return Number(city.shippingPrice);
}

exports.addProductToCart = asyncHandler(async (req, res) => {
    const {productId, isAvailablePdf, isAvailablePaper} = req.body;

    const product = await ProductModel.findById(productId);
    let cart = await CartModel.findOne({user: req.loggedUser._id});

    const price = isAvailablePdf ? await checkSubscription(req.loggedUser._id, product["pricePdf"]) : await checkSubscription(req.loggedUser._id, product["pricePaper"]);

    if (!cart) {
        cart = await CartModel.create({
            user: req.loggedUser._id,
            cartItems: [{
                product: productId,
                price: price,
                isAvailablePdf: isAvailablePdf,
                isAvailablePaper: isAvailablePaper,
            }]
        });
    } else {
        const productAlreadyInCart = cart["cartItems"].find(item => item.product._id.toString() === productId.toString());

        if (productAlreadyInCart) {
            return res.status(400).json(
                apiSuccess(
                    req.__("alreadyCart"),
                    400,
                    null
                ));
        } else {
            cart["cartItems"].push({
                product: productId,
                price: price,
                isAvailablePdf: isAvailablePdf,
                isAvailablePaper: isAvailablePaper,
            });
        }
    }

    if (isAvailablePaper === true) {
        cart.shippingPrice = await getSippingPrice(req.loggedUser._id);
    } else {
        cart.shippingPrice = 0;
    }

    calculateTotalCartPrice(cart);
    await cart.save();

    return res.status(201).json(
        apiSuccess(
            res.__("successAddProductToCart"),
            201,
            null
        ));
});

exports.getMyCart = asyncHandler(async (req, res) => {
    const cart = await CartModel.findOne({user: req.loggedUser._id});

    return res.status(200).json(
        apiSuccess(
            res.__("successGetMyCart"),
            200,
            {cart: cartData(cart, req)},
        ));
});

exports.deleteSpecificProductFromCart = asyncHandler(async (req, res) => {
    const {productId} = req.params

    const cart = await CartModel.findOneAndUpdate(
        {user: req.loggedUser._id},
        {$pull: {cartItems: {product: productId}}},
        {new: true}
    );

    calculateTotalCartPrice(cart);
    await cart.save();

    return res.status(200).json(
        apiSuccess(
            res.__("successDeleteSpecificProductFromCart"),
            200,
            {cart: cartData(cart, req)},
        ));
});

exports.clearCart = asyncHandler(async (req, res) => {
    await CartModel.findOneAndDelete({user: req.loggedUser._id});

    return res.status(200).json(
        apiSuccess(
            res.__("successClearCart"),
            200,
            null
        ));
});
