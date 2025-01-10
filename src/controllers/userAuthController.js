const crypto = require("crypto");

const bcrypt = require("bcryptjs");

const asyncHandler = require("../middlewares/asyncHandler");
const generateJWT = require("../utils/generateJWT");
const apiSuccess = require("../utils/apiSuccess");
const UserModel = require("../models/userModel");
const {sendSMSInfobip} = require("../middlewares/sendSMSInfobip");

exports.signup = asyncHandler(async (req, res) => {
    const user = await UserModel.create(req.body);

    user.password = await bcrypt.hash(user.password, 12)

    const activateCode = Math.floor(1000 + Math.random() * 9000).toString();

    user.accountActivateCode = crypto
        .createHash("sha256")
        .update(activateCode)
        .digest("hex")
    user.AccountActivateExpires = Date.now() + 10 * 60 * 1000;
    let phone = req.body.phone;
    phone = phone.slice(1);
    
    try {

        await sendSMSInfobip({
            "messages": [
                {
                    "destinations": [{"to": `${phone}`}],
                    "from": "Khezanat-Alkutub",
                    "text": `${activateCode} ${req.__("smsBodyRegister")}`
                }
            ]
        });
    } catch (error) {
        user.accountActivateCode = undefined;
        user.AccountActivateExpires = undefined;
    }

    await user.save();

    return res.status(201).json(
        apiSuccess(
            req.__("successUserSignup"),
            201,
            {activateCode},
        ));
});

exports.verifyPhone = asyncHandler(async (req, res) => {
    const user = await UserModel.findOne({phone: req.body.phone});

    user.accountActive = true;
    user.accountActivateCode = undefined;
    user.AccountActivateExpires = undefined;
    await user.save();

    const token = await generateJWT({id: user._id, role: "user"});

    return res.status(200).json(
        apiSuccess(
            req.__("successUserVerifyPhone"),
            200,
            {token},
        ));
});

exports.login = asyncHandler(async (req, res) => {
    const {deviceToken} = req.body;

    const user = await UserModel.findOne({phone: req.body.phone});

    const token = await generateJWT({id: user._id, role: "user"});

    if (deviceToken) {
        user.deviceToken = deviceToken;
        await user.save();
    }

    return res.status(200).json(
        apiSuccess(
            `${req.__("successLogin")} ${user.name}`,
            200,
            {token},
        ));
});

exports.forgotPassword = asyncHandler(async (req, res) => {
    const user = await UserModel.findOne({phone: req.body.phone});

    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();

    user.passwordResetCode = crypto
        .createHash("sha256")
        .update(resetCode)
        .digest("hex");
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    user.passwordResetVerified = false;

    await user.save();
    let phone = req.body.phone;
    phone = phone.slice(1);
    try {
        await sendSMSInfobip({
            "messages": [
                {
                    "destinations": [{"to": `${phone}`}],
                    "from": "Khezanat-Alkutub",
                    "text": `${resetCode} ${req.__("smsBodyForgotPassword")}`
                }
            ]
        });
    } catch (error) {
        user.passwordResetCode = undefined;
        user.passwordResetExpires = undefined;
        user.passwordResetVerified = undefined;

        await user.save();
    }

    return res.status(200).json(
        apiSuccess(
            req.__("successForgetPassword"),
            200,
            {resetCode},
        ));
});

exports.verifyCode = asyncHandler(async (req, res) => {
    const user = await UserModel.findOne({phone: req.body.phone});

    user.passwordResetVerified = true;
    await user.save();

    return res.status(200).json(
        apiSuccess(
            req.__("successVerifyCode"),
            200,
            null,
        ));
});

exports.resetPassword = asyncHandler(async (req, res) => {
    const {deviceToken} = req.body;

    const user = await UserModel.findOne({phone: req.body.phone});

    user.password = await bcrypt.hash(req.body.password, 12);
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;

    if (deviceToken) {
        user.deviceToken = deviceToken;
    }

    await user.save();

    const token = await generateJWT({id: user._id, role: "user"});

    return res.status(200).json(
        apiSuccess(
            `${req.__("successResetPassword")} ${user.name}`,
            200,
            {token},
        ));
});

exports.resendCode = asyncHandler(async (req, res) => {
    const user = await UserModel.findOne({phone: req.body.phone});

    const code = Math.floor(1000 + Math.random() * 9000).toString();

    user.accountActivateCode = crypto
        .createHash("sha256")
        .update(code)
        .digest("hex")
    user.AccountActivateExpires = Date.now() + 10 * 60 * 1000;
    let phone = req.body.phone;
    phone = phone.slice(1);
    try {
        await sendSMSInfobip({
            "messages": [
                {
                    "destinations": [{"to": `${phone}`}],
                    "from": "Khezanat-Alkutub",
                    "text": `${code} ${req.__("smsBodyResendCode")}`
                }
            ]
        });
    } catch (error) {
        user.accountActivateCode = undefined;
        user.AccountActivateExpires = undefined;
    }

    await user.save();

    return res.status(200).json(
        apiSuccess(
            req.__("successResendCode"),
            200,
            {code},
        ));
});