const fs = require('fs');
const path = require("path");
const parsePhoneNumber = require('libphonenumber-js')
const sharp = require("sharp");
const bcrypt = require("bcryptjs");

const asyncHandler = require("../middlewares/asyncHandler");
const generateJWT = require("../utils/generateJWT");
const {uploadSingleFile} = require("../middlewares/uploadFileMiddleware");
const {userData, allUserData} = require("../utils/responseModelData");
const {getLocale} = require("../middlewares/setLocale");
const apiSuccess = require("../utils/apiSuccess");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const UserModel = require("../models/userModel");
const SubscriptionModel = require("../models/subscriptionModel");
const AppControlModel = require("../models/appControlModel");
const axios = require('axios');

exports.setProfileID = asyncHandler(async (req, res, next) => {
    req.params.id = req.loggedUser._id;
    next();
});

exports.getUser = asyncHandler(async (req, res, next) => {
    const {id} = req.params;

    let user = await UserModel.findById(id);

    if (!user) {
        return next(new ApiError(`No user found for this ID ${id}`, 404))
    }

    const appControl = await AppControlModel.findOne({app: "khezanatalkutub"});

    let city = appControl["cities"].find((city) =>
        city._id.equals(user.city)
    );

    user = user.toObject();

    user.city = city;

    return res.status(200).json(
        apiSuccess(
            res.__("successGetUser"),
            200,
            {user: userData(user, req)}
        ));
});

exports.updateUser = asyncHandler(async (req, res) => {
    const {id} = req.params;

    const user = await UserModel.findByIdAndUpdate(id, {
        name: req.body.name,
        gender: req.body.gender,
        birthday: req.body.birthday,
        city: req.body.city,
    }, {
        new: true,
    });

    if (req.body.interestedCategory) {
        const allInterestedCategory = new Set([...user.interestedCategory, ...req.body.interestedCategory]);
        user.interestedCategory = Array.from(allInterestedCategory);
        await user.save();
    }

    return res.status(200).json(
        apiSuccess(
            res.__("successUpdateUser"),
            200,
            null
        ));

});

// exports.deleteUser = asyncHandler(async (req, res) => {
//     const {id} = req.params;
//
//     const user = await UserModel.findByIdAndDelete(id);
//
//     if (user.profileImg.public_id) {
//         await cloudinary.uploader.destroy(user.profileImg.public_id);
//     }
//
//     const cart = await CartModel.findOne({user: user._id});
//
//     if (cart) {
//         await CartModel.deleteOne({user: user._id});
//     }
//
//     return res.status(200).json(
//         apiSuccess(
//             res.__("successDeleteUser"),
//             200,
//             null,
//         ));
//
// });

exports.blockUser = asyncHandler(async (req, res) => {
    const {id} = req.params;

    await UserModel.findByIdAndUpdate(id, {haveBlock: true});

    return res.status(200).json(
        apiSuccess(
            res.__("successBlockUser"),
            200,
            null,
        ));
});

exports.activeUser = asyncHandler(async (req, res) => {
    const {id} = req.params;

    await UserModel.findByIdAndUpdate(id, {haveBlock: false});

    return res.status(200).json(
        apiSuccess(
            res.__("successActiveUser"),
            200,
            null,
        ));
});

exports.changePassword = asyncHandler(async (req, res) => {
    const id = req.loggedUser._id;

    const user = await UserModel.findByIdAndUpdate(
        id,
        {
            password: await bcrypt.hash(req.body.password, 12),
            passwordChangedAt: Date.now(),
        },
        {
            new: true,
        }
    );

    const token = await generateJWT({id: user["_id"], role: "user"});

    return res.status(200).json(
        apiSuccess(
            res.__("successChangePassword"),
            200,
            {token}
        ));
});

exports.uploadProfileImage = uploadSingleFile("profileImg");

exports.resizeAuthorProfileImage = asyncHandler(async (req, res, next) => {
    const outputDir = path.join(__dirname, "../../uploads/users");

    const fileName = `user-${Math.round(
        Math.random() * 1e9
    )}-${Date.now()}.png`;

    if (req.file) {
        try {
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, {recursive: true});
            }

            await sharp(req.file.buffer)
                .toFormat("png")
                .png({quality: 90})
                .toFile(`uploads/users/${fileName}`);

            req.body.profileImg = fileName;
        } catch (error) {
            return next(new ApiError(`Image processing failed: ${error.message}`, 500));
        }
    }
    next();
});

exports.updateProfileImage = asyncHandler(async (req, res) => {
    const user = await UserModel.findByIdAndUpdate(req.loggedUser._id, {profileImg: req.body.profileImg});

    if (user["profileImg"]) {
        const filePath = path.join(__dirname, "../../uploads/users/", user.profileImg);
        await fs.unlinkSync(filePath);
    }

    return res.status(200).json(
        apiSuccess(
            res.__("successUpdateProfileImage"),
            200,
            null,
        ));
});

exports.getAllUsers = asyncHandler(async (req, res) => {
    const usersCount = await UserModel.countDocuments();

    const apiFeatures = new ApiFeatures(UserModel.find(), req.query)
        .paginate(usersCount)
        .filter()
        .sort()

    const {paginationResult, mongooseQuery} = apiFeatures;

    let users = await mongooseQuery;

    const appControl = await AppControlModel.findOne({app: "khezanatalkutub"});

    users = users.map((user) => {
        let city = appControl["cities"].find((city) =>
            city._id.equals(user.city)
        );
        user = user.toObject();

        user.city = city;
        return user;
    });

    return res.status(200).json(
        apiSuccess(
            res.__("successGetAllUser"),
            200,
            {
                pagination: paginationResult,
                users: allUserData(users, req),
            }
        ));
});

exports.search = asyncHandler(async (req, res) => {
    const {keyword} = req.query;

    const queryObj = {};
    queryObj.$or = [
        {name: {$regex: keyword, $options: "i"}},
        {phone: {$regex: keyword, $options: "i"},},
    ]

    const usersCount = await UserModel.countDocuments(queryObj);

    const apiFeatures = new ApiFeatures(UserModel.find(queryObj), req.query)
        .paginate(usersCount)

    const {paginationResult, mongooseQuery} = apiFeatures;

    const users = await mongooseQuery;

    return res.status(200).json(
        apiSuccess(
            res.__("successGetAllUser"),
            200,
            {
                pagination: paginationResult,
                users: allUserData(users, req),
            }
        ));
});

exports.subscribeAccount = asyncHandler(async (req, res, next) => {
    const {subscriptionId} = req.params;

    const subscriptionPlan = await SubscriptionModel.findById(subscriptionId);
    const user = await UserModel.findById(req.loggedUser._id);

    if (user.subscription._id.toString() !== '67a24c8b4c9399dd5c5f037d') {
        return next(new ApiError(`you are already subscribed to plan ${user.subscription.name[getLocale(req)]}`, 400))
    }
    const requestURL = 'https://api-sa.myfatoorah.com/v2/SendPayment'; 
    const requestHeader = {
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${process.env.PAYMENT_TOKEN_LIVE}`,
            'Content-Type': 'application/json'
        }
    }
        let phone_number = parsePhoneNumber(user["phone"]);

        const requestBody = {
            CustomerName: user["name"],
            InvoiceValue: subscriptionPlan["price"],
            NotificationOption: 'ALL',
            DisplayCurrencyIso: 'SAR',
            MobileCountryCode: `+${phone_number.countryCallingCode}`,
            CustomerMobile: phone_number.nationalNumber,
            CallBackUrl: 'https://khezanatalkutub.com/Subscription', 
            ErrorUrl: 'https://khezanatalkutub.com',
            CustomerEmail : user["email"] ?? "empty@empty.com",
            Language: getLocale(req),
            InvoiceItems: [{
                ItemName : subscriptionPlan["name"][getLocale(req)],
                Quantity : 1,
                UnitPrice : subscriptionPlan["price"],
            }],
        }
        const myFatoorahRequest = await axios.post(requestURL ,requestBody ,requestHeader  );
        return res.status(200).json(
            apiSuccess(
                "Checkout Success",
                200,
                {checkout: myFatoorahRequest.data.Data},
            )
        );
        // user.subscription = subscriptionId;
        // user.subscriptionBegan = Date.now();
        // user.subscriptionEnd = new Date().setDate(new Date().getDate() + subscriptionPlan["duration"]);
        // await user.save();
        // move it to web-hook 

    // return res.status(200).json(
    //     apiSuccess(
    //         res.__("successSubscribeAccount"),
    //         200,
    //         null
    //     ));

});

exports.unsubscribeAccount = asyncHandler(async (req, res, next) => {
    const {subscriptionId} = req.params;

    const user = await UserModel.findById(req.loggedUser._id);

    if (user["subscription"]._id.toString() !== subscriptionId) {
        return next(new ApiError(`you are not subscribe to this plan`, 400))
    }

    if (!user["allowUnsubscribe"]) {
        return next(new ApiError(res.__("notAllowUnsubscribe"), 400))
    } else {
        // todo: refund still make it or not 

        await UserModel.findByIdAndUpdate(req.loggedUser._id, {
            subscription: '67a24c8b4c9399dd5c5f037d',
            subscriptionBegan: null,
            subscriptionEnd: null,
        });
    }

    return res.status(200).json(
        apiSuccess(
            res.__("successUnsubscribeAccount"),
            200,
            null
        ));
});

exports.addAddress = asyncHandler(async (req, res) => {

    const user = await UserModel.findById(req.loggedUser._id);

    for (let i = 0; i < user["addresses"].length; i++) {
        if (JSON.stringify(req.body) === JSON.stringify(user["addresses"][i], ["street", "city", "buildNumber"])
        ) {
            return res.status(400).json(
                apiSuccess(
                    res.__("addressUsed"),
                    400,
                    null,
                ));
        }
    }

    await UserModel.updateOne(
        { _id: req.loggedUser._id }, 
        { $addToSet: { addresses: req.body } } 
    );

    return res.status(201).json(
        apiSuccess(
            res.__("successAddAddress"),
            200,
            null
        ));

});

exports.removeAddress = asyncHandler(async (req, res) => {
    const {addressId} = req.params;

    await UserModel.findByIdAndUpdate(
        req.loggedUser._id,
        {
            $pull: {addresses: {_id: addressId}},
        },
        {new: true}
    );

    return res.status(200).json(
        apiSuccess(
            res.__("successRemoveAddress"),
            200,
            null
        ));
});

exports.mainAddress = asyncHandler(async (req, res) => {
    const {addressId} = req.params;

    await UserModel.updateOne(
        {_id: req.loggedUser._id},
        {$set: {"addresses.$[].main": false}}
    );

    await UserModel.updateOne(
        {_id: req.loggedUser._id, "addresses._id": addressId},
        {$set: {"addresses.$.main": true}}
    );

    return res.status(200).json(
        apiSuccess(
            res.__("successMainAddress"),
            200,
            null
        ));
})