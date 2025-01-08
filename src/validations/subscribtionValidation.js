const {body, param} = require("express-validator");

const ApiError = require("../utils/apiError");
const SubscriptionModel = require("../models/subscriptionModel");
const UserModel = require("../models/userModel");

exports.addSubscriptionPlanValidation = [
    body("name.ar")
        .notEmpty()
        .withMessage("ar name of subscription is required")
        .isLength({min: 3})
        .withMessage("Too short subscription name")
        .isLength({max: 32})
        .withMessage("Too long subscription name"),

    body("name.en")
        .notEmpty()
        .withMessage("en name of subscription is required")
        .isLength({min: 3})
        .withMessage("Too short subscription name")
        .isLength({max: 32})
        .withMessage("Too long subscription name"),

    body("description.ar")
        .notEmpty()
        .withMessage("ar description of subscription is required")
        .isLength({min: 50})
        .withMessage("Too short subscription description")
        .isLength({max: 500})
        .withMessage("Too long subscription description"),

    body("description.en")
        .notEmpty()
        .withMessage("en description of subscription is required")
        .isLength({min: 50})
        .withMessage("Too short subscription description")
        .isLength({max: 500})
        .withMessage("Too long subscription description"),

    body("price")
        .notEmpty()
        .withMessage("price of subscription is required")
        .isNumeric()
        .withMessage("Invalid price subscription"),

    body("duration")
        .optional()
        .isNumeric()
        .withMessage("Invalid duration subscription"),

    body("coupon")
        .notEmpty()
        .withMessage("coupon of subscription is required")
        .isLength({min: 0, max: 100})
];

exports.updateSubscriptionPlanValidation = [
    param("id")
        .isMongoId()
        .withMessage("invalid subscription id")
        .custom(async (val) => {
            const subscription = await SubscriptionModel.findById(val);

            if (!subscription) {
                return Promise.reject(new ApiError(`no subscription for this id ${val}`, 404));
            }
            return true;
        }),

    body("name.ar")
        .optional()
        .isLength({min: 3})
        .withMessage("Too short subscription name")
        .isLength({max: 32})
        .withMessage("Too long subscription name"),

    body("name.en")
        .optional()
        .isLength({min: 3})
        .withMessage("Too short subscription name")
        .isLength({max: 32})
        .withMessage("Too long subscription name"),

    body("price")
        .optional()
        .isNumeric()
        .withMessage("Invalid price subscription"),

    body("duration")
        .optional()
        .isNumeric()
        .withMessage("Invalid duration subscription"),

    body("coupon")
        .optional()
        .isLength({min: 0, max: 100}),
];

exports.deleteSubscriptionPlanValidation = [
    param("id")
        .isMongoId()
        .withMessage("invalid subscription id")
        .custom(async (val, {req}) => {
            const subscription = await SubscriptionModel.findById(val);

            if (!subscription) {
                return Promise.reject(new ApiError(`no subscription for this id ${val}`, 404));
            }

            const user = await UserModel.findOne({'subscription': val});

            if(subscription["_id"].toString() === '676a9a598d28c651357217c3' || user){
                return Promise.reject(new ApiError(req.__("notAllowedSubscriptionDelete"), 404));
            }

            return true;
        }),
];