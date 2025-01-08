const multer = require("multer");

const ApiError = require("../utils/apiError");

const multerOptions = () => {
    const multerStorage = multer.memoryStorage();
    const multerFilter = function (req, file, cb) {
        if (file.mimetype.startsWith("image") || file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new ApiError(req.__("onlyImage"), 400), false);
        }
    };

    return multer({storage: multerStorage, fileFilter: multerFilter});
};

const uploadSingleFile = (fieldName) => multerOptions().single(fieldName);

const uploadMixOfFile = (arrOfFields) => multerOptions().fields(arrOfFields);

module.exports = {uploadSingleFile, uploadMixOfFile};
