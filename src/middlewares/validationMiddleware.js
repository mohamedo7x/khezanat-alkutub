const {validationResult} = require("express-validator");

const ApiError = require("../utils/apiError");
const {deleteImageAfterValidationError} = require("../utils/deleteImageAfterValidationError");

const validatorMiddleware = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        await deleteImageAfterValidationError(req);
        return next(new ApiError(errors.array()[0].msg, 400));
    }
    // if (!errors.isEmpty()) {
    //     return res.status(400).json({ errors: errors.array() });
    // }
    next();
};

module.exports = validatorMiddleware;
