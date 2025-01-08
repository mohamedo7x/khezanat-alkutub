const path = require("path");
const fs = require("fs");

const sharp = require("sharp");

const asyncHandler = require("../middlewares/asyncHandler");
const {
    privacyPolicyData,
    termsAndConditionsData,
    aboutUsData,
    homeBannerData,
    cityData,
    featureItemsData
} = require("../utils/responseModelData");
const {uploadSingleFile} = require("../middlewares/uploadFileMiddleware");
const apiSuccess = require("../utils/apiSuccess");
const ApiError = require("../utils/apiError");
const AppControlModel = require("../models/appControlModel");

exports.uploadHomeBannerImage = uploadSingleFile("image");

exports.resizeHomeBannerImage = asyncHandler(async (req, res, next) => {
    if (req.file) {
        const outputDir = path.join(__dirname, "../../uploads/app");

        const fileName = `home-banner-${Math.round(
            Math.random() * 1e9
        )}-${Date.now()}.${req.file.originalname.split(".").slice(-1)[0]}`;

        if (req.file) {
            try {
                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, {recursive: true});
                }

                await sharp(req.file.buffer)
                    .toFile(`uploads/app/${fileName}`);

                req.body.image = fileName;
            } catch (error) {
                return next(new ApiError(`Image processing failed: ${error.message}`, 500));
            }
        }
    }
    next();
});

exports.addHomeBanner = asyncHandler(async (req, res, next) => {
    const appControl = await AppControlModel.findOne({
        app: "khezanatalkutub"
    });

    if (!appControl) {
        await AppControlModel.create({
            homeBanner: {
                title: {
                    ar: req.body["arTitle"],
                    en: req.body["enTitle"],
                    id: req.body["idTitle"],
                    zh: req.body["zhTitle"],
                },
                image: req.body.image,
            }
        });
    } else {
        if (appControl.homeBanner.title.ar === undefined && appControl.homeBanner.title.en === undefined && appControl.homeBanner.title.zh === undefined && appControl.homeBanner.title.id === undefined && appControl.homeBanner.image === undefined) {
            appControl.homeBanner = {
                title: {
                    ar: req.body["arTitle"],
                    en: req.body["enTitle"],
                    id: req.body["idTitle"],
                    zh: req.body["zhTitle"],
                },
                image: req.body.image,
            }

            await appControl.save();
        } else {
            return next(new ApiError("there is already a home banner, update it if you need", 400))
        }
    }

    return res.status(201).json(
        apiSuccess(
            res.__("successAddHomeBanner"),
            201,
            null,
        ));
});

exports.updateHomeBanner = asyncHandler(async (req, res, next) => {
    const {arTitle, enTitle, idTitle, zhTitle, image} = req.body;

    // Prepare update fields
    const updateFields = {
        ...(arTitle || enTitle || idTitle || zhTitle) && {
            "homeBanner.title": {
                ...(arTitle && {ar: arTitle}),
                ...(enTitle && {en: enTitle}),
                ...(idTitle && {id: idTitle}),
                ...(zhTitle && {zh: zhTitle}),
            },
        },
        ...(image && {"homeBanner.image": image}),
    };

    // Update the document in the database
    const appControl = await AppControlModel.findOneAndUpdate(
        {app: "khezanatalkutub"},
        {$set: updateFields},
        {new: true}
    );

    if (!appControl) {
        return next(new ApiError("There is no Home banner, please add one first", 400));
    }

    // Delete the old image if a new one is provided
    if (image && appControl?.homeBanner?.image) {
        const oldImagePath = path.join(__dirname, "../../uploads/app/", appControl.homeBanner.image);
        try {
            fs.unlinkSync(oldImagePath);
        } catch (err) {
            console.error("Error deleting old image:", err);
        }
    }

    return res.status(200).json(
        apiSuccess(
            res.__("successUpdateHomeBanner"),
            200,
            null,
        ));
});

exports.getHomeBanner = asyncHandler(async (req, res) => {
    const appControl = await AppControlModel.findOne({app: "khezanatalkutub"}, 'homeBanner');

    return res.status(200).json(
        apiSuccess(
            res.__("successGetHomeBanner"),
            200,
            {homeBanner: homeBannerData(appControl["homeBanner"], req)},
        ));
});

exports.addNewCity = asyncHandler(async (req, res) => {
    const appControl = await AppControlModel.findOne({
        app: "khezanatalkutub"
    });

    const newCity = {
        title: {
            ar: req.body["arCity"],
            en: req.body["enCity"],
            id: req.body["idCity"],
            zh: req.body["zhCity"],
        },
        shippingPrice: req.body.shippingPrice
    };

    if (!appControl) {
        await AppControlModel.create({
            cities: [newCity]
        });
    } else {
        await AppControlModel.updateOne(
            {app: "khezanatalkutub"},
            {$addToSet: {cities: newCity}}
        );
    }

    return res.status(201).json(
        apiSuccess(
            res.__("successAddNewCity"),
            201,
            null,
        ));
});

exports.removeCity = asyncHandler(async (req, res) => {
    const {cityId} = req.params;

    await AppControlModel.findOneAndUpdate(
        {app: "khezanatalkutub"},
        {$pull: {cities: {_id: cityId}}},
        {new: true}
    );

    return res.status(200).json(
        apiSuccess(
            res.__("successRemoveCity"),
            200,
            null
        ));
});

exports.getCities = asyncHandler(async (req, res) => {
    const appControl = await AppControlModel.findOne({app: "khezanatalkutub"}, 'cities');

    return res.status(200).json(
        apiSuccess(
            res.__("successGetCities"),
            200,
            {cities: cityData(appControl["cities"], req)},
        ));
});

exports.addAboutUs = asyncHandler(async (req, res) => {
    const appControl = await AppControlModel.findOne({
        app: "khezanatalkutub"
    });

    if (!appControl) {
        await AppControlModel.create({
            aboutUs: {
                title: {
                    ar: req.body["arTitle"],
                    en: req.body["enTitle"],
                    id: req.body["idTitle"],
                    zh: req.body["zhTitle"],
                },
                description: {
                    ar: req.body["arDescription"],
                    en: req.body["enDescription"],
                    id: req.body["idDescription"],
                    zh: req.body["zhDescription"],
                },
                footerDescription: {
                    ar: req.body["arFooterDescription"],
                    en: req.body["enFooterDescription"],
                    id: req.body["idFooterDescription"],
                    zh: req.body["zhFooterDescription"],
                },
                linkVideo: req.body.linkVideo,
                email: req.body.email,
                phone: req.body.phone,
                location: {
                    address: req.body.address,
                    lat: req.body.lat,
                    lng: req.body.lng,
                },
                workDate: {
                    from: req.body.from,
                    to: req.body.to,
                }
            }
        });
    } else {
        appControl.aboutUs = {
            title: {
                ar: req.body["arTitle"],
                en: req.body["enTitle"],
                id: req.body["idTitle"],
                zh: req.body["zhTitle"],
            },
            description: {
                ar: req.body["arDescription"],
                en: req.body["enDescription"],
                id: req.body["idDescription"],
                zh: req.body["zhDescription"],
            },
            footerDescription: {
                ar: req.body["arFooterDescription"],
                en: req.body["enFooterDescription"],
                id: req.body["idFooterDescription"],
                zh: req.body["zhFooterDescription"],
            },
            linkVideo: req.body.linkVideo,
            email: req.body.email,
            phone: req.body.phone,
            location: {
                address: req.body.address,
                lat: req.body.lat,
                lng: req.body.lng,
            },
            workDate: {
                from: req.body.from,
                to: req.body.to,
            }
        }

        await appControl.save();
    }

    return res.status(201).json(
        apiSuccess(
            res.__("successAddAboutUs"),
            201,
            null,
        ));
});

exports.updateAboutUs = asyncHandler(async (req, res) => {
    const updateFields = {
        ...(req.body["arTitle"] && {"aboutUs.title.ar": req.body["arTitle"]}),
        ...(req.body["enTitle"] && {"aboutUs.title.en": req.body["enTitle"]}),
        ...(req.body["idTitle"] && {"aboutUs.title.id": req.body["idTitle"]}),
        ...(req.body["zhTitle"] && {"aboutUs.title.zh": req.body["zhTitle"]}),
        ...(req.body["arDescription"] && {"aboutUs.description.ar": req.body["arDescription"]}),
        ...(req.body["enDescription"] && {"aboutUs.description.en": req.body["enDescription"]}),
        ...(req.body["idDescription"] && {"aboutUs.description.id": req.body["idDescription"]}),
        ...(req.body["zhDescription"] && {"aboutUs.description.zh": req.body["zhDescription"]}),
        ...(req.body["arFooterDescription"] && {"aboutUs.footerDescription.ar": req.body["arFooterDescription"]}),
        ...(req.body["enFooterDescription"] && {"aboutUs.footerDescription.en": req.body["enFooterDescription"]}),
        ...(req.body["idFooterDescription"] && {"aboutUs.footerDescription.id": req.body["idFooterDescription"]}),
        ...(req.body["zhFooterDescription"] && {"aboutUs.footerDescription.zh": req.body["zhFooterDescription"]}),
        ...(req.body.linkVideo && {"aboutUs.linkVideo": req.body.linkVideo}),
        ...(req.body.email && {"aboutUs.email": req.body.email}),
        ...(req.body.phone && {"aboutUs.phone": req.body.phone}),
        ...(req.body.address && {"aboutUs.location.address": req.body.address}),
        ...(req.body.lat && {"aboutUs.location.lat": req.body.lat}),
        ...(req.body.lng && {"aboutUs.location.lng": req.body.lng}),
        ...(req.body.from && {"aboutUs.workDate.from": req.body.from}),
        ...(req.body.to && {"aboutUs.workDate.to": req.body.to}),
    };

    await AppControlModel.findOneAndUpdate(
        {app: "khezanatalkutub"},
        {$set: updateFields}
    );

    return res.status(200).json(
        apiSuccess(
            res.__("successUpdateAboutUs"),
            200,
            null,
        ));
});

exports.getAboutUs = asyncHandler(async (req, res) => {
    const appControl = await AppControlModel.findOne({app: "khezanatalkutub"}, 'aboutUs');

    return res.status(200).json(
        apiSuccess(
            res.__("successGetAboutUs"),
            200,
            {aboutUs: aboutUsData(appControl["aboutUs"], req)},
        ));
});

exports.uploadFeatureItemIcon = uploadSingleFile("image");

exports.resizeFeatureItemIcon = asyncHandler(async (req, res, next) => {
    const outputDir = path.join(__dirname, "../../uploads/app");

    const fileName = `feature-item-${Math.round(
        Math.random() * 1e9
    )}-${Date.now()}.${req.file.originalname.split(".").slice(-1)[0]}`;

    if (req.file) {
        try {
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, {recursive: true});
            }

            await sharp(req.file.buffer)
                .toFile(`uploads/app/${fileName}`);

            req.body.image = fileName;
        } catch (error) {
            return next(new ApiError(`Image processing failed: ${error.message}`, 500));
        }
    }
    next();
});

exports.addNewFeatureItem = asyncHandler(async (req, res) => {
    const appControl = await AppControlModel.findOne({
        app: "khezanatalkutub"
    });

    const newFeatureItem = {
        title: {
            ar: req.body["arTitle"],
            en: req.body["enTitle"],
            id: req.body["idTitle"],
            zh: req.body["zhTitle"],
        },
        subTitle: {
            ar: req.body["arSubTitle"],
            en: req.body["enSubTitle"],
            id: req.body["idSubTitle"],
            zh: req.body["zhSubTitle"],
        },
        image: req.body.image
    };

    if (!appControl) {
        await AppControlModel.create({
            featureItems: [newFeatureItem]
        });
    } else {
        await AppControlModel.updateOne(
            {app: "khezanatalkutub"},
            {$addToSet: {featureItems: newFeatureItem}}
        );
    }

    return res.status(201).json(
        apiSuccess(
            res.__("successAddNewFeatureItem"),
            201,
            null,
        ));
});

exports.removeFeatureItem = asyncHandler(async (req, res) => {
    const {featureItemId} = req.params;

    await AppControlModel.findOneAndUpdate(
        {app: "khezanatalkutub"},
        {$pull: {featureItems: {_id: featureItemId}}},
        {new: true}
    );

    return res.status(200).json(
        apiSuccess(
            res.__("successRemoveFeatureItem"),
            200,
            null
        ));
});

exports.getFeatureItems = asyncHandler(async (req, res) => {
    const appControl = await AppControlModel.findOne({app: "khezanatalkutub"}, 'featureItems');

    return res.status(200).json(
        apiSuccess(
            res.__("successGetFeatureItems"),
            200,
            {featureItems: featureItemsData(appControl["featureItems"], req)},
        ));
});

exports.addPrivacyPolicy = asyncHandler(async (req, res, next) => {
    const appControl = await AppControlModel.findOne({
        app: "khezanatalkutub"
    });

    if (!appControl) {
        await AppControlModel.create({
            privacyPolicy: {
                ar: req.body["arPrivacyPolicy"],
                en: req.body["enPrivacyPolicy"],
                id: req.body["idPrivacyPolicy"],
                zh: req.body["zhPrivacyPolicy"],
            }
        });
    } else {
        if (appControl.privacyPolicy.ar === undefined && appControl.privacyPolicy.en === undefined && appControl.privacyPolicy.zh === undefined && appControl.privacyPolicy.id === undefined) {
            appControl.privacyPolicy = {
                ar: req.body["arPrivacyPolicy"],
                en: req.body["enPrivacyPolicy"],
                id: req.body["idPrivacyPolicy"],
                zh: req.body["zhPrivacyPolicy"],
            }

            await appControl.save();
        } else {
            return next(new ApiError("there is already a privacy policy, update it if you need", 400))
        }
    }

    return res.status(201).json(
        apiSuccess(
            res.__("successAddPrivacyPolicy"),
            201,
            null,
        ));
});

exports.updatePrivacyPolicy = asyncHandler(async (req, res, next) => {
    const {arPrivacyPolicy, enPrivacyPolicy, idPrivacyPolicy, zhPrivacyPolicy} = req.body;

    const updateFields = {};
    if (arPrivacyPolicy) updateFields["privacyPolicy.ar"] = arPrivacyPolicy;
    if (enPrivacyPolicy) updateFields["privacyPolicy.en"] = enPrivacyPolicy;
    if (enPrivacyPolicy) updateFields["privacyPolicy.id"] = idPrivacyPolicy;
    if (enPrivacyPolicy) updateFields["privacyPolicy.zh"] = zhPrivacyPolicy;

    const appControl = await AppControlModel.findOneAndUpdate(
        {app: "khezanatalkutub"},
        {
            $set: updateFields
        },
        {new: true}
    );

    if (!appControl) {
        return next(new ApiError("there is no privacy policy, please add one first", 400))
    }

    return res.status(200).json(
        apiSuccess(
            res.__("successUpdatePrivacyPolicy"),
            200,
            null,
        ));
});

exports.getPrivacyPolicy = asyncHandler(async (req, res) => {
    const appControl = await AppControlModel.findOne({app: "khezanatalkutub"}, 'privacyPolicy');

    return res.status(200).json(
        apiSuccess(
            res.__("successGetPrivacyPolicy"),
            200,
            {privacyPolicy: privacyPolicyData(appControl["privacyPolicy"], req)},
        ));
});

exports.addTermsAndConditions = asyncHandler(async (req, res, next) => {
    const appControl = await AppControlModel.findOne({
        app: "khezanatalkutub"
    });

    if (!appControl) {
        await AppControlModel.create({
            termsAndConditions: {
                ar: req.body["arTermsAndConditions"],
                en: req.body["enTermsAndConditions"],
                id: req.body["idTermsAndConditions"],
                zh: req.body["zhTermsAndConditions"],
            }
        });
    } else {
        if (appControl.termsAndConditions.ar === undefined && appControl.termsAndConditions.en === undefined && appControl.termsAndConditions.zh === undefined && appControl.termsAndConditions.id === undefined) {
            appControl.termsAndConditions = {
                ar: req.body["arTermsAndConditions"],
                en: req.body["enTermsAndConditions"],
                id: req.body["idTermsAndConditions"],
                zh: req.body["zhTermsAndConditions"],
            }

            await appControl.save();
        } else {
            return next(new ApiError("there is already a Terms and Conditions, update it if you need", 400))
        }
    }

    return res.status(201).json(
        apiSuccess(
            res.__("successAddTermsAndConditions"),
            201,
            null,
        ));
});

exports.updateTermsAndConditions = asyncHandler(async (req, res, next) => {
    const {arTermsAndConditions, enTermsAndConditions, idTermsAndConditions, zhTermsAndConditions} = req.body;

    const updateFields = {};
    if (arTermsAndConditions) updateFields["termsAndConditions.ar"] = arTermsAndConditions;
    if (enTermsAndConditions) updateFields["termsAndConditions.en"] = enTermsAndConditions;
    if (enTermsAndConditions) updateFields["termsAndConditions.zh"] = zhTermsAndConditions;
    if (enTermsAndConditions) updateFields["termsAndConditions.id"] = idTermsAndConditions;

    const appControl = await AppControlModel.findOneAndUpdate({app: "khezanatalkutub"}, {$set: updateFields});

    if (!appControl) {
        return next(new ApiError("there is no Terms and Conditions, please add one first", 400))
    }

    return res.status(200).json(
        apiSuccess(
            res.__("successUpdateTermsAndConditions"),
            200,
            null,
        ));
});

exports.getTermsAndConditions = asyncHandler(async (req, res) => {
    const appControl = await AppControlModel.findOne({app: "khezanatalkutub"}, 'termsAndConditions');

    return res.status(200).json(
        apiSuccess(
            res.__("successGetTermsAndConditions"),
            200,
            {termsAndConditions: termsAndConditionsData(appControl["termsAndConditions"], req)},
        ));
});

exports.getApp = asyncHandler(async (req, res) => {
    const appControl = await AppControlModel.findOne({app: "khezanatalkutub"}, '-author -__v -updatedAt -createdAt');

    return res.status(200).json(
        apiSuccess(
            "Get App Success",
            200,
            {app: appControl},
        ));
});
