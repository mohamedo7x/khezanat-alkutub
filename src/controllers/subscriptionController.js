const asyncHandler = require("../middlewares/asyncHandler");
const {allSubscriptionPlansData, allSubscriptionPlansDataNoLang} = require("../utils/responseModelData");
const apiSuccess = require("../utils/apiSuccess");
const SubscriptionModel = require("../models/subscriptionModel");

exports.addSubscriptionPlan = asyncHandler(async (req, res) => {
    await SubscriptionModel.create(req.body);

    return res.status(201).json(
        apiSuccess(
            res.__("successAddSubscriptionPlan"),
            201,
            null,
        ));
});

exports.getSubscriptionPlans = asyncHandler(async (req, res) => {
    const subscriptionPlans = await SubscriptionModel.find().sort('price');

    return res.status(200).json(
        apiSuccess(
            res.__("successGetSubscriptionPlans"),
            200,
            {
                subscriptionPlans: req.query.dashboard ? allSubscriptionPlansDataNoLang(subscriptionPlans) : allSubscriptionPlansData(subscriptionPlans, req),
            },
        ));
});

exports.updateSubscriptionPlan = asyncHandler(async (req, res) => {
    const {id} = req.params;

    await SubscriptionModel.findByIdAndUpdate(id, req.body);

    return res.status(200).json(
        apiSuccess(
            res.__("successUpdateSubscriptionPlan"),
            200,
            null,
        ));
});

exports.deleteSubscriptionPlan = asyncHandler(async (req, res) => {
    const {id} = req.params;

    await SubscriptionModel.findByIdAndDelete(id);

    return res.status(200).json(
        apiSuccess(
            res.__("successDeleteSubscriptionPlan"),
            200,
            null,
        ));
});