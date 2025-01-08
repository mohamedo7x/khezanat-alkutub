const {deleteImageAfterValidationError} = require("../utils/deleteImageAfterValidationError");
const asyncHandler = (fn) => (req, res, next) => {
    fn(req, res, next).catch(async (error) => {
        await deleteImageAfterValidationError(req);
        next(error);
    });
};

module.exports = asyncHandler;