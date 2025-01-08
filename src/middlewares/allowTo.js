const asyncHandler = require("./asyncHandler");
const ApiError = require("../utils/apiError");
const AdminModel = require("../models/adminModel");
const UserModel = require("../models/userModel");
const AuthorModel = require("../models/authorModel");

exports.allowedToUser = () => asyncHandler(async (req, res, next) => {
    const user = await UserModel.findById(req.loggedUser._id);

    if (!user) {
        req.allowError = true;
    } else {
        if (user["subscription"]._id.toString() === '676a9a598d28c651357217c3') {
            req.allowSuccess = true;
        } else {
            const inputDate = new Date(user["subscriptionEnd"]);
            const currentDate = new Date();

            if (inputDate < currentDate) {
                return next(new ApiError("The date has already passed.", 403));
            } else {
                req.allowSuccess = true;
            }
        }
    }
    next();
});

exports.allowedToAuthor = () => asyncHandler(async (req, res, next) => {
    const author = await AuthorModel.findById(req.loggedUser._id);

    if (!author) {
        req.allowError = true;
    } else {
        req.allowSuccess = true;
    }
    next();
});

exports.allowedToAdmins = (...roles) => asyncHandler(async (req, res, next) => {
    const admin = await AdminModel.findById(req.loggedUser._id, "roles");

    if (!admin || !roles.some(role => admin.roles.includes(role))) {
        req.allowError = true;
    } else {
        req.allowSuccess = true;
    }
    next();
});

exports.permissionValidate = (req, res, next) => {
    if (req.allowSuccess) {
        next();
    } else if (req.allowError) {
        return next(new ApiError("You are not allowed access this route", 403));
    } else {
        next();
    }
}