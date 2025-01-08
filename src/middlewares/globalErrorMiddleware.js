const ApiError = require("../utils/apiError");

const handelJWTInvalidSignature = (req) =>
    new ApiError(req.__("invalidToken"), 401);

const handelJWTExpired = (req) =>
    new ApiError(req.__("expiredToken"), 401);

const sendErrorForDev = (error,req, res) =>
    res.status(error.statusCode).json({
        status: error.status,
        code: error.statusCode,
        message: error.message,
        error: error,
        stack: error.stack,
    });

const sendErrorForProd = (error,req, res) =>
    res.status(error.statusCode).json({
        status: error.status,
        code: error.statusCode,
        message: error.message,
    });

const globalError = (error, req, res, next) => {
    error.statusCode = error.statusCode || 500;
    error.status = error.status || "error";

    if (process.env.NODE_ENV === "development") {
        sendErrorForDev(error,req, res,next);
    } else {
        if (error.name === "JsonWebTokenError") error = handelJWTInvalidSignature(req);
        if (error.name === "TokenExpiredError") error = handelJWTExpired(req);
        sendErrorForProd(error,req, res,next);
    }
};

module.exports = globalError;