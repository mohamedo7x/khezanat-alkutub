const multer = require("multer");

const ApiError = require("../utils/apiError");

const multerOptions = (prefixFile) => {
    const multerStorage = multer.diskStorage({
        filename: function (req, file, cb) {
            const fileName = `${prefixFile}-${Math.round(Math.random() * 1e9)}-${Date.now()}`;

            cb(null, fileName);
        },
    });

    const multerFilter = function (req, file, cb) {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new ApiError(req.__("onlyImage"), 400), false);
        }
    };

    return multer({fileFilter: multerFilter, storage: multerStorage});
};

const uploadSingleImage = (fieldName, prefixFile) => multerOptions(prefixFile).single(fieldName);

const uploadMixOfImage = (arrOfFields, prefixFile) => multerOptions(prefixFile).fields(arrOfFields);


module.exports = {uploadSingleImage, uploadMixOfImage}