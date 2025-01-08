const crypto = require("crypto");

const bcrypt = require("bcryptjs");

const asyncHandler = require("../middlewares/asyncHandler");
const generateJWT = require("../utils/generateJWT");
const apiSuccess = require("../utils/apiSuccess");
const ApiError = require("../utils/apiError");
const AuthorModel = require("../models/authorModel");

// exports.createAuthor = asyncHandler(async (req, res) => {
//     const author = await AuthorModel.create(req.body);
//
//     author.password = await bcrypt.hash(author.password, 12)
//     author.accountActive = true;
//     await author.save();
//
//     // const activateCode = Math.floor(1000 + Math.random() * 9000).toString();
//     //
//     // author.accountActivateCode = crypto
//     //     .createHash("sha256")
//     //     .update(activateCode)
//     //     .digest("hex")
//     // author.AccountActivateExpires = Date.now() + 10 * 60 * 1000;
//     // try {
//     //     // todo: send sms message
//     // } catch (error) {
//     //     author.accountActivateCode = undefined;
//     //     author.AccountActivateExpires = undefined;
//     // }
//     //
//
//     return res.status(201).json(
//         apiSuccess(
//             req.__("successAuthorSignup"),
//             201,
//             null,
//         ));
// });

// exports.verifyPhone = asyncHandler(async (req, res) => {
//     const author = await AuthorModel.findOne({phone: req.body.phone});
//
//     author.accountActive = true;
//     author.accountActivateCode = undefined;
//     author.AccountActivateExpires = undefined;
//     await author.save();
//
//     const token = await generateJWT({id: author._id, role: "author"});
//
//     return res.status(200).json(
//         apiSuccess(
//             req.__("successAuthorVerifyPhone"),
//             200,
//             {token},
//         ));
// });

exports.login = asyncHandler(async (req, res) => {
    const author = await AuthorModel.findOne({phone: req.body.phone});

    const token = await generateJWT({id: author._id, role: "author"});

    return res.status(200).json(
        apiSuccess(
            `${req.__("successLogin")} ${author.name}`,
            200,
            {token, role: "author",},
        ));
});

exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const author = await AuthorModel.findOne({phone: req.body.phone});

    const resetCode = Math.floor(1000 + Math.random() * 9000).toString();

    author.passwordResetCode = crypto
        .createHash("sha256")
        .update(resetCode)
        .digest("hex");
    author.passwordResetExpires = Date.now() + 10 * 60 * 1000;
    author.passwordResetVerified = false;

    await author.save();

    try {
        // todo: send sms message
    } catch (error) {
        author.passwordResetCode = undefined;
        author.passwordResetExpires = undefined;
        author.passwordResetVerified = undefined;

        await author.save();
    }

    return res.status(200).json(
        apiSuccess(
            req.__("successForgetPassword"),
            200,
            {resetCode},
        ));
});

exports.verifyCode = asyncHandler(async (req, res) => {
    const author = await AuthorModel.findOne({phone: req.body.phone});

    author.passwordResetVerified = true;
    await author.save();

    return res.status(200).json(
        apiSuccess(
            req.__("successVerifyCode"),
            200,
            null,
        ));
});

exports.resetPassword = asyncHandler(async (req, res) => {
    const author = await AuthorModel.findOne({phone: req.body.phone});

    author.password = await bcrypt.hash(req.body.password, 12);
    author.passwordResetCode = undefined;
    author.passwordResetExpires = undefined;
    author.passwordResetVerified = undefined;

    await author.save();

    const token = await generateJWT({id: author._id, role: "author"});

    return res.status(200).json(
        apiSuccess(
            `${req.__("successResetPassword")} ${author.name}`,
            200,
            {token},
        ));
});

exports.resendCode = asyncHandler(async (req, res, next) => {
    const author = await AuthorModel.findOne({phone: req.body.phone});

    const code = Math.floor(1000 + Math.random() * 9000).toString();

    author.accountActivateCode = crypto
        .createHash("sha256")
        .update(code)
        .digest("hex")
    author.AccountActivateExpires = Date.now() + 10 * 60 * 1000;

    try {
        // todo: send sms message
    } catch (error) {
        author.accountActivateCode = undefined;
        author.AccountActivateExpires = undefined;
    }

    await author.save();

    return res.status(200).json(
        apiSuccess(
            req.__("successResendCode"),
            200,
            {code},
        ));
});