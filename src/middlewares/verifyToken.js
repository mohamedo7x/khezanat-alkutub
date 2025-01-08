const jwt = require("jsonwebtoken")

const asyncHandler = require("../middlewares/asyncHandler");
const ApiError = require("../utils/apiError");
const UserModel = require("../models/userModel");
const AuthorModel = require("../models/authorModel");
const AdminModel = require("../models/adminModel");

const verifyToken = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    }

    if (!token || token === 'undefined') {
        return next(new ApiError(req.__("forbiddenRoute"), 403));
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    } catch (e) {
        return next(new ApiError(req.__("tokenChange"), 401));
    }

    if (decoded.role === "admin") {
        const currentUser = await AdminModel.findById(decoded.id);

        if (!currentUser) {
            return next(
                new ApiError(req.__("noAdminRoute"), 401)
            );
        }

        req.loggedUser = currentUser;
        next();
    } else {
        const currentUser = await UserModel.findById(decoded.id) || await AuthorModel.findById(decoded.id);

        if (!currentUser) {
            return next(
                new ApiError(req.__("noUserRoute"), 401)
            );
        }

        if (!currentUser.accountActive) {
            return next(
                new ApiError(req.__("noActivated"), 400)
            );
        }

        if (currentUser.haveBlock) {
            return next(
                new ApiError(req.__("blocked"), 400)
            );
        }

        if (currentUser.passwordChangedAt) {
            const passwordChangedTimeStamp = parseInt(
                currentUser.passwordChangedAt.getTime() / 1000,
                10
            );

            // password changed after token created
            if (passwordChangedTimeStamp > decoded.iat) {
                return next(new ApiError(req.__("changedTokenPassword"), 401));
            }
        }

        req.loggedUser = currentUser;
        next();
    }
});

module.exports = verifyToken;