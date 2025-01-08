const {body} = require("express-validator");
const ApiError = require("../utils/apiError");

exports.getAnalysisDashboardValidation = [
    body("startAt")
        .optional()
        .matches(/^\d{4}-\d{1,2}-\d{1,2}/)
        .withMessage("please enter valid date match as (yyyy-mm-dd)")
        .custom((val, {req}) => {
            if (val) {
                if (!req.body.endAt) {
                    return Promise.reject(new ApiError("endAt is required when startAt is provided", 400));
                }
            }

            return true;
        }),

    body("endAt")
        .optional()
        .matches(/^\d{4}-\d{1,2}-\d{1,2}/)
        .withMessage("please enter valid date match as (yyyy-mm-dd)")
        .custom((val, {req}) => {
            if (val) {
                if (!req.body.startAt) {
                    return Promise.reject(new ApiError("startAt is required when endAt is provided", 400));
                }
            }

            return true;
        }),
];