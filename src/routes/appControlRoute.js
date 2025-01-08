const express = require("express");

const {
    addPrivacyPolicy,
    updatePrivacyPolicy,
    getPrivacyPolicy,
    addTermsAndConditions,
    updateTermsAndConditions,
    getTermsAndConditions,
    addAboutUs,
    updateAboutUs,
    getAboutUs,
    addNewCity,
    removeCity,
    getCities,
    uploadHomeBannerImage,
    resizeHomeBannerImage,
    addHomeBanner,
    updateHomeBanner,
    getHomeBanner,
    uploadFeatureItemIcon,
    resizeFeatureItemIcon,
    addNewFeatureItem,
    getFeatureItems,
    removeFeatureItem,
    getApp,
} = require("../controllers/appControlController");
const {
    addNewCityValidation,
    removeCityValidation,
    addHomeBannerValidation,
    addFeatureItemValidation,
    removeFeatureItemValidation,
    updateHomeBannerValidation,
    addAboutUsValidation,
    updateAboutUsValidation,
    addPrivacyPolicyValidation,
    updatePrivacyPolicyValidation,
    addTermsAndConditionsValidation,
    updateTermsAndConditionsValidation,
} = require("../validations/appControlValidation")
const validationMiddleware = require("../middlewares/validationMiddleware");
const verifyToken = require("../middlewares/verifyToken");
const {allowedToAdmins, permissionValidate} = require("../middlewares/allowTo");

const router = express.Router();

router.get("/", getApp);

router.route("/city")
    .get(getCities)
    .post(
        verifyToken, allowedToAdmins("controlApp"), permissionValidate,
        addNewCityValidation, validationMiddleware,
        addNewCity
    );

router.delete("/city/:cityId",
    verifyToken, allowedToAdmins("controlApp"), permissionValidate,
    removeCityValidation, validationMiddleware,
    removeCity
);

router.route("/homeBanner")
    .get(getHomeBanner)
    .post(
        verifyToken, allowedToAdmins("controlApp"), permissionValidate,
        uploadHomeBannerImage, resizeHomeBannerImage,
        addHomeBannerValidation, validationMiddleware,
        addHomeBanner
    )
    .patch(
        verifyToken, allowedToAdmins("controlApp"), permissionValidate,
        uploadHomeBannerImage, resizeHomeBannerImage,
        updateHomeBannerValidation, validationMiddleware,
        updateHomeBanner
    );

router.route("/aboutUs")
    .get(getAboutUs)
    .post(
        verifyToken, allowedToAdmins("controlApp"), permissionValidate,
        addAboutUsValidation, validationMiddleware,
        addAboutUs
    )
    .patch(
        verifyToken, allowedToAdmins("controlApp"), permissionValidate,
        updateAboutUsValidation, validationMiddleware,
        updateAboutUs
    );

router.route("/featureItem")
    .get(getFeatureItems)
    .post(
        verifyToken, allowedToAdmins("controlApp"), permissionValidate,
        uploadFeatureItemIcon, resizeFeatureItemIcon,
        addFeatureItemValidation, validationMiddleware,
        addNewFeatureItem
    );

router.delete("/featureItem/:featureItemId",
    verifyToken, allowedToAdmins("controlApp"), permissionValidate,
    removeFeatureItemValidation, validationMiddleware,
    removeFeatureItem,
);

router.route("/privacyPolicy")
    .get(getPrivacyPolicy)
    .post(
        verifyToken, allowedToAdmins("controlApp"), permissionValidate,
        addPrivacyPolicyValidation, validationMiddleware,
        addPrivacyPolicy
    )
    .patch(
        verifyToken, allowedToAdmins("controlApp"), permissionValidate,
        updatePrivacyPolicyValidation, validationMiddleware,
        updatePrivacyPolicy
    );

router.route("/termsAndConditions")
    .get(getTermsAndConditions)
    .post(
        verifyToken, allowedToAdmins("controlApp"), permissionValidate,
        addTermsAndConditionsValidation, validationMiddleware,
        addTermsAndConditions
    )
    .patch(
        verifyToken, allowedToAdmins("controlApp"), permissionValidate,
        updateTermsAndConditionsValidation, validationMiddleware,
        updateTermsAndConditions
    );

module.exports = router