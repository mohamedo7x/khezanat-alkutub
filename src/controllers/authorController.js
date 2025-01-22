const fs = require('fs');
const path = require("path");

const sharp = require("sharp");
const bcrypt = require("bcryptjs");

const asyncHandler = require("../middlewares/asyncHandler");
const generateJWT = require("../utils/generateJWT");
const {uploadSingleFile} = require("../middlewares/uploadFileMiddleware");
const {authorData, allAuthorData, allAuthorFormData} = require("../utils/responseModelData");
const apiSuccess = require("../utils/apiSuccess");
const ApiError = require("../utils/apiError");
const ApiFeatures = require("../utils/apiFeatures");
const AuthorModel = require("../models/authorModel");
const CreateAuthorFormModel = require("../models/createAuthorFormModel");

exports.setProfileID = asyncHandler(async (req, res, next) => {
    req.params.id = req.loggedUser._id;
    next();
});

exports.getAuthor = asyncHandler(async (req, res, next) => {
    const {id} = req.params;

    const author = await AuthorModel.findById(id);

    if (!author) {
        return next(new ApiError(`No author found for this ID ${id}`, 404))
    }

    return res.status(200).json(
        apiSuccess(
            res.__("successGetAuthor"),
            200,
            {author: authorData(author, req)}
        ));
});

exports.updateAuthor = asyncHandler(async (req, res) => {
    const {id} = req.params;

    await AuthorModel.findByIdAndUpdate(id, {
        name: req.body.name,
        gender: req.body.gender,
        bio: req.body.bio,
        birthday: req.body.birthday,
    }, {
        new: true,
    });

    return res.status(200).json(
        apiSuccess(
            res.__("successUpdateAuthor"),
            200,
            null
        ));

});

// exports.deleteAuthor = asyncHandler(async (req, res) => {
//     const {id} = req.params;
//
//     const author = await AuthorModel.findByIdAndDelete(id);
//
//     if (author.profileImg.public_id) {
//         await cloudinary.uploader.destroy(author.profileImg.public_id);
//     }
//
//     return res.status(200).json(
//         apiSuccess(
//             res.__("successDeleteAuthor"),
//             200,
//             null,
//         ));
//
// });

exports.blockAuthor = asyncHandler(async (req, res) => {
    const {id} = req.params;

    await AuthorModel.findByIdAndUpdate(id, {haveBlock: true});

    return res.status(200).json(
        apiSuccess(
            res.__("successBlockAuthor"),
            200,
            null,
        ));

});

exports.activeAuthor = asyncHandler(async (req, res) => {
    const {id} = req.params;

    await AuthorModel.findByIdAndUpdate(id, {haveBlock: false});

    return res.status(200).json(
        apiSuccess(
            res.__("successActiveUser"),
            200,
            null,
        ));

});

exports.changePassword = asyncHandler(async (req, res) => {
    const id = req.loggedUser._id;

    const author = await AuthorModel.findByIdAndUpdate(
        id,
        {
            password: await bcrypt.hash(req.body.password, 12),
            passwordChangedAt: Date.now(),
        },
        {
            new: true,
        }
    );

    const token = await generateJWT({id: author._id, role: "author"});

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

    const fileName = `author-${Math.round(
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
    const author = await AuthorModel.findByIdAndUpdate(req.loggedUser._id, {profileImg: req.body.profileImg});

    if (author["profileImg"]) {
        const filePath = path.join(__dirname, "../../uploads/users/", author.profileImg);
        await fs.unlinkSync(filePath);
    }

    return res.status(200).json(
        apiSuccess(
            res.__("successUpdateProfileImage"),
            200,
            null,
        ));
});

exports.getAllAuthors = asyncHandler(async (req, res) => {
    const authorsCount = await AuthorModel.countDocuments();

    const apiFeatures = new ApiFeatures(AuthorModel.find(), req.query)
        .paginate(authorsCount)
        .filter()
        .sort()

    const {paginationResult, mongooseQuery} = apiFeatures;

    const authors = await mongooseQuery;

    return res.status(200).json(
        apiSuccess(
            res.__("successGetAllAuthor"),
            200,
            {
                pagination: paginationResult,
                authors: allAuthorData(authors, req),
            }
        ));
});

exports.search = asyncHandler(async (req, res) => {
    const {keyword} = req.query;

    const queryObj = {};
    queryObj.$or = [
        {name: {$regex: keyword, $options: "i"}},
        {bio: {$regex: keyword, $options: "i"}},
        {phone: {$regex: keyword, $options: "i"},},
    ]


    const authorsCount = await AuthorModel.countDocuments(queryObj);

    const apiFeatures = new ApiFeatures(AuthorModel.find(queryObj), req.query)
        .paginate(authorsCount)

    const {paginationResult, mongooseQuery} = apiFeatures;

    const authors = await mongooseQuery;

    return res.status(200).json(
        apiSuccess(
            res.__("successGetAllAuthor"),
            200,
            {
                paginationResult: paginationResult,
                authors: allAuthorData(authors, req),
            }
        ));
});

exports.addAddress = asyncHandler(async (req, res) => {
    const author = await AuthorModel.findById(req.loggedUser._id);

    for (let i = 0; i < author["addresses"].length; i++) {
        if (JSON.stringify(req.body) === JSON.stringify(author.addresses[i], ["street", "city", "buildNumber"])
        ) {
            return res.status(400).json(
                apiSuccess(
                    res.__("addressUsed"),
                    400,
                    null,
                ));
        }
    }

    await author.updateOne({
            $addToSet: {addresses: req.body},
        },
        {new: true}
    )

    return res.status(201).json(
        apiSuccess(
            res.__("successAddAddress"),
            200,
            null
        ));

});

exports.removeAddress = asyncHandler(async (req, res) => {
    const {addressId} = req.params;

    await AuthorModel.findByIdAndUpdate(
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

exports.uploadAuthorFormProfileImage = uploadSingleFile("profileImg");

exports.resizeAuthorFormProfileImage = asyncHandler(async (req, res, next) => {
    const outputDir = path.join(__dirname, "../../uploads/users/authorForm");

    const fileName = `author-form-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`;

    if (req.file) {
        try {
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, {recursive: true});
            }
            const mainPath = path.join(__dirname, ".." , ".." , "uploads" , "users" , "authorForm" , fileName.toString());
            console.log(mainPath)
            await sharp(req.file.buffer)
                .toFormat("png")
                .png({quality: 90})
                .toFile(mainPath);

            req.body.profileImg = fileName.toString();
        } catch (error) {
            return next(new ApiError(`Image processing failed: ${error.message}`, 500));
        }
    }
    next();
});

exports.formCreateAuthor = asyncHandler(async (req, res) => {
    await CreateAuthorFormModel.create({
        name: req.body.name,
        bio: req.body.bio,
        phone: req.body.phone,
        profileImg: req.body.profileImg,
        birthday: req.body.birthday,
        gender: req.body.gender,
    });

    return res.status(200).json(
        apiSuccess(
            res.__("successFormCreateAuthor"),
            200,
            null,
        ));
});

exports.confirmCreateAuthor = asyncHandler(async (req, res) => {
    const {id} = req.params

    
    const author = await CreateAuthorFormModel.findOne({_id:id});

    if (author.profileImg) {
        const filePath = path.join(__dirname, "../../uploads/users/authorForm/", author.profileImg);
         fs.unlinkSync(filePath);
    }
    await CreateAuthorFormModel.findByIdAndDelete(id);
    return res.status(200).json(
        apiSuccess(
            res.__("successConfirmCreateAuthor"),
            200,
            null,
        ));
});

exports.getAuthorForm = asyncHandler(async (req, res) => {
    const authorsCount = await CreateAuthorFormModel.countDocuments();

    const apiFeatures = new ApiFeatures(CreateAuthorFormModel.find(), req.query)
        .paginate(authorsCount);

    const {paginationResult, mongooseQuery} = apiFeatures;

    const authors = await mongooseQuery;

    return res.status(200).json(
        apiSuccess(
            res.__("successGetAuthorForm"),
            200,
            {
                pagination: paginationResult,
                authors: allAuthorFormData(authors, req),
            }
        ));
});

exports.createNewAuthor = asyncHandler(async (req, res) => {
    const author = await AuthorModel.create(req.body);

    author.password = await bcrypt.hash(author.password, 12)
    author.accountActive = true;
    await author.save();

    return res.status(201).json(
        apiSuccess(
            req.__("successAuthorSignup"),
            201,
            null,
        ));
});