const asyncHandler = require("../middlewares/asyncHandler");

const {allProductData} = require("../utils/responseModelData");
const apiSuccess = require("../utils/apiSuccess");
const UserModel = require("../models/userModel");

exports.addProductToWishlist = asyncHandler(async (req, res) => {
    const {productId} = req.body;

    await UserModel.findByIdAndUpdate(
        req.loggedUser._id,
        {
            $addToSet: {wishlist: productId},
        },
        {new: true}
    );

    return res.status(200).json(
        apiSuccess(
            res.__("successAddProductToWishlist"),
            200,
            null
        ));
});

exports.removeProductFromWishlist = asyncHandler(async (req, res) => {
    const {productId} = req.body;

    await UserModel.findByIdAndUpdate(
        req.loggedUser._id,
        {
            $pull: {wishlist: productId},
        },
        {new: true}
    );

    return res.status(200).json(
        apiSuccess(
            res.__("successRemoveProductFromWishlist"),
            200,
            null
        ));
});

exports.getMyWishlist = asyncHandler(async (req, res) => {
    const user = await UserModel.findById(req.loggedUser._id, 'wishlist').populate("wishlist");

    return res.status(200).json(
        apiSuccess(
            res.__("successGetMyWishlist"),
            200,
            {wishlist: allProductData(user["wishlist"], req)}
        ));
});
