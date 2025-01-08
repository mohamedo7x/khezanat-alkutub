const fs = require('fs');
const path = require("path");

const sharp = require("sharp");
const bcrypt = require("bcryptjs");

const asyncHandler = require("../middlewares/asyncHandler");
const generateJWT = require("../utils/generateJWT");
const {uploadSingleFile} = require("../middlewares/uploadFileMiddleware");
const {allAdminData, adminData} = require("../utils/responseModelData");
const apiSuccess = require("../utils/apiSuccess");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const AdminModel = require("../models/adminModel");

exports.uploadProfileImage = uploadSingleFile("profileImg");

exports.resizeAdminProfileImage = asyncHandler(async (req, res, next) => {
    const outputDir = path.join(__dirname, "../../uploads/users");

    const fileName = `admin-${Math.round(
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

exports.createAdmin = asyncHandler(async (req, res) => {
    const admin = await AdminModel.create(req.body);
    admin.password = await bcrypt.hash(admin.password, 12)
    admin.roles = [...new Set(admin.roles)];

    await admin.save();

    return res.status(201).json(
        apiSuccess(
            req.__("successAdminCreate"),
            201,
            null,
        ));
});

exports.login = asyncHandler(async (req, res) => {
    const admin = await AdminModel.findOne({phone: req.body.phone});

    const token = await generateJWT({id: admin["_id"], role: "admin"});

    return res.status(200).json(
        apiSuccess(
            `${req.__("successLogin")} ${admin["name"].split(" ")[0]}`,
            200,
            {
                token,
                role: "admin",
            },
        ));
});

exports.getAdmins = asyncHandler(async (req, res) => {
    const adminsCount = await AdminModel.countDocuments();

    const apiFeatures = new ApiFeatures(AdminModel.find(), req.query)
        .paginate(adminsCount)
        .filter()
        .sort()

    const {paginationResult, mongooseQuery} = apiFeatures;

    const admins = await mongooseQuery;

    return res.status(200).json(
        apiSuccess(
            req.__("successAdminGetAll"),
            200,
            {
                pagination: paginationResult,
                admins: allAdminData(admins, req),
            }
        ));
});

exports.search = asyncHandler(async (req, res) => {
    const {keyword} = req.query;

    const queryObj = {};
    queryObj.$or = [
        {name: {$regex: keyword, $options: "i"}},
        {email: {$regex: keyword, $options: "i"},},
        {phone: {$regex: keyword, $options: "i"},},
        {address: {$regex: keyword, $options: "i"},},
    ]

    const adminsCount = await AdminModel.countDocuments(queryObj);

    const apiFeatures = new ApiFeatures(AdminModel.find(queryObj), req.query)
        .paginate(adminsCount)

    const {paginationResult, mongooseQuery} = apiFeatures;

    const admins = await mongooseQuery;

    return res.status(200).json(
        apiSuccess(
            req.__("successAdminGetAll"),
            200,
            {
                pagination: paginationResult,
                admins: allAdminData(admins, req),
            }
        ));
});

exports.getAdmin = asyncHandler(async (req, res) => {
    const {id} = req.params;

    const admin = await AdminModel.findById(id);

    return res.status(200).json(
        apiSuccess(
            req.__("successAdminGetAdmin"),
            200,
            {admin: adminData(admin, req)},
        ))
});

exports.updateAdmin = asyncHandler(async (req, res) => {
    const {id} = req.params;

    const admin = await AdminModel.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        gender: req.body.gender,
        role: req.body.role,
        address: req.body.address
    }, {
        new: true,
    });

    if (req.body.password) {
        admin.password = await bcrypt.hash(admin.password, 12)
        admin.save();
    }

    return res.status(200).json(
        apiSuccess(
            req.__("successAdminUpdateAdmin"),
            200,
            null
        ));

});

exports.deleteAdmin = asyncHandler(async (req, res) => {
    const {id} = req.params;

    const admin = await AdminModel.findByIdAndDelete(id);

    if (admin["profileImg"]) {
        const filePath = path.join(__dirname, "../../uploads/users/", admin["profileImg"]);
        await fs.unlinkSync(filePath);
    }

    return res.status(200).json(
        apiSuccess(
            req.__("successAdminDeleteAdmin"),
            200,
            null
        ));

});

exports.setProfileID = asyncHandler(async (req, res, next) => {
    req.params.id = req.loggedUser._id;
    next();
});

exports.updateProfile = asyncHandler(async (req, res) => {
    const {id} = req.params;

    const admin = await AdminModel.findByIdAndUpdate(id, {
        name: req.body.name,
        email: req.body.email,
        gender: req.body.gender,
        address: req.body.address,
    }, {
        new: true,
    });

    if (req.body.password) {
        admin.password = await bcrypt.hash(admin.password, 12)
        admin.save();
    }

    return res.status(200).json(
        apiSuccess(
            req.__("successAdminUpdateProfile"),
            200,
            null
        ));
});

exports.updateImgProfile = asyncHandler(async (req, res) => {
    const {id} = req.params;

    const admin = await AdminModel.findByIdAndUpdate(id, {
        profileImg: req.body.profileImg,
    });

    if (admin["profileImg"]) {
        const filePath = path.join(__dirname, "../../uploads/users/", admin["profileImg"]);
        await fs.unlinkSync(filePath);
    }

    return res.status(200).json(
        apiSuccess(
            req.__("successUpdateProfileImage"),
            200,
            null
        ));
});

exports.changePassword = asyncHandler(async (req, res) => {
    const id = req.loggedUser._id;

    const admin = await AdminModel.findByIdAndUpdate(
        id,
        {
            password: await bcrypt.hash(req.body.password, 12),
            passwordChangedAt: Date.now(),
        },
        {
            new: true,
        }
    );

    const token = await generateJWT({id: admin._id, role: "admin"});

    return res.status(200).json(
        apiSuccess(
            req.__("successChangePassword"),
            200,
            {token}
        ));
})