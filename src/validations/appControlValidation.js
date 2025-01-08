const {body, param} = require("express-validator");
const ApiError = require("../utils/apiError");
const UserModel = require("../models/userModel");

exports.addNewCityValidation = [
    body("arCity")
        .notEmpty()
        .withMessage("ar City is required"),

    body("enCity")
        .notEmpty()
        .withMessage("en City is required"),

    body("idCity")
        .notEmpty()
        .withMessage("id City is required"),

    body("zhCity")
        .notEmpty()
        .withMessage("zh City is required"),

    body("shippingPrice")
        .notEmpty()
        .withMessage("Shipping price is required"),
];

exports.removeCityValidation = [
    param("cityId")
        .notEmpty()
        .withMessage("city id is required")
        .custom(async (val, {req}) => {
            const user = await UserModel.findOne({'city': val});

            if (user) {
                return Promise.reject(new ApiError(req.__("notAllowedCityDelete"), 400));
            }

            return true;
        }),
];

exports.addHomeBannerValidation = [
    body("arTitle")
        .notEmpty()
        .withMessage("ar Title is required"),

    body("enTitle")
        .notEmpty()
        .withMessage("en Title is required"),

    body("idTitle")
        .notEmpty()
        .withMessage("id Title is required"),

    body("zhTitle")
        .notEmpty()
        .withMessage("zh Title is required"),

    body("image")
        .notEmpty()
        .withMessage("Banner image is required"),
];

exports.updateHomeBannerValidation = [
    body("arTitle")
        .optional(),

    body("enTitle")
        .optional(),

    body("idTitle")
        .optional(),

    body("zhTitle")
        .optional(),

    body("image")
        .optional(),
];

exports.addAboutUsValidation = [
    body("arTitle")
        .notEmpty()
        .withMessage("ar Title is required"),

    body("enTitle")
        .notEmpty()
        .withMessage("en Title is required"),

    body("idTitle")
        .notEmpty()
        .withMessage("id Title is required"),

    body("zhTitle")
        .notEmpty()
        .withMessage("zh Title is required"),

    body("arDescription")
        .notEmpty()
        .withMessage("ar Description is required"),

    body("enDescription")
        .notEmpty()
        .withMessage("en Description is required"),

    body("idDescription")
        .notEmpty()
        .withMessage("id Description is required"),

    body("zhDescription")
        .notEmpty()
        .withMessage("zh Description is required"),

    body("arFooterDescription")
        .notEmpty()
        .withMessage("ar footer description is required"),

    body("enFooterDescription")
        .notEmpty()
        .withMessage("en footer description is required"),

    body("idFooterDescription")
        .notEmpty()
        .withMessage("id footer description is required"),

    body("zhFooterDescription")
        .notEmpty()
        .withMessage("zh footer description is required"),

    body("linkVideo")
        .notEmpty()
        .withMessage("link video is required"),

    body("email")
        .notEmpty()
        .withMessage("email is required"),

    body("phone")
        .notEmpty()
        .withMessage("phone video is required"),

    body("address")
        .notEmpty()
        .withMessage("address video is required"),

    body("lat")
        .notEmpty()
        .withMessage("lat video is required"),

    body("lng")
        .notEmpty()
        .withMessage("lng video is required"),

    body("from")
        .notEmpty()
        .withMessage("from video is required"),

    body("to")
        .notEmpty()
        .withMessage("to video is required"),
];

exports.updateAboutUsValidation = [
    body("arTitle").optional(),
    body("enTitle").optional(),
    body("idTitle").optional(),
    body("zhTitle").optional(),
    body("arDescription").optional(),
    body("enDescription").optional(),
    body("idDescription").optional(),
    body("zhDescription").optional(),
    body("arFooterDescription").optional(),
    body("enFooterDescription").optional(),
    body("idFooterDescription").optional(),
    body("zhFooterDescription").optional(),
    body("linkVideo").optional(),
    body("email").optional(),
    body("phone").optional(),
    body("address").optional(),
    body("lat").optional(),
    body("lng").optional(),
    body("from").optional(),
    body("to").optional()
];

exports.addFeatureItemValidation = [
    body("arTitle")
        .notEmpty()
        .withMessage("ar Title is required"),

    body("enTitle")
        .notEmpty()
        .withMessage("en Title is required"),

    body("idTitle")
        .notEmpty()
        .withMessage("id Title is required"),

    body("zhTitle")
        .notEmpty()
        .withMessage("zh Title is required"),

    body("arSubTitle")
        .notEmpty()
        .withMessage("ar SubTitle is required"),

    body("enSubTitle")
        .notEmpty()
        .withMessage("en SubTitle is required"),

    body("idSubTitle")
        .notEmpty()
        .withMessage("id SubTitle is required"),

    body("zhSubTitle")
        .notEmpty()
        .withMessage("zh SubTitle is required"),

    body("image")
        .notEmpty()
        .withMessage("Banner image is required"),
];

exports.removeFeatureItemValidation = [
    param("featureItemId")
        .notEmpty()
        .withMessage("feature item id is required"),
];

exports.addPrivacyPolicyValidation = [
    body("arPrivacyPolicy")
        .notEmpty()
        .withMessage("ar privacy policy is required"),

    body("enPrivacyPolicy")
        .notEmpty()
        .withMessage("en privacy policy is required"),

    body("idPrivacyPolicy")
        .notEmpty()
        .withMessage("id privacy policy is required"),

    body("zhPrivacyPolicy")
        .notEmpty()
        .withMessage("zh privacy policy is required")
];

exports.updatePrivacyPolicyValidation = [
    body("arPrivacyPolicy").optional(),
    body("enPrivacyPolicy").optional(),
    body("idPrivacyPolicy").optional(),
    body("zhPrivacyPolicy").optional()
];

exports.addTermsAndConditionsValidation = [
    body("arTermsAndConditions")
        .notEmpty()
        .withMessage("ar Terms and Conditions is required"),

    body("enTermsAndConditions")
        .notEmpty()
        .withMessage("en Terms and Conditions is required"),

    body("zhTermsAndConditions")
        .notEmpty()
        .withMessage("zh Terms and Conditions is required"),

    body("idTermsAndConditions")
        .notEmpty()
        .withMessage("id Terms and Conditions is required")
];

exports.updateTermsAndConditionsValidation = [
    body("arTermsAndConditions").optional(),
    body("enTermsAndConditions").optional(),
    body("idTermsAndConditions").optional(),
    body("zhTermsAndConditions").optional()
];