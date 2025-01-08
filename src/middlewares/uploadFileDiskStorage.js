// const multer = require("multer");
//
// const ApiError = require("../utils/apiError");
//
// const multerOptions = () => {
//     // disk storage
//     const multerStorage = multer.diskStorage({
//         destination: function (req, file, cb) {
//             cb(null, "uploads/products/pdfs");
//         },
//         filename: function (req, file, cb) {
//             const ext = file.mimetype.split("/")[1];
//             const fileName = `${file.originalname.replace(/\.pdf$/, '')}-${Date.now()}.${ext}`;
//             cb(null, fileName);
//         },
//     });
//
//     const multerFilter = function (req, file, cb) {
//         if (file.mimetype === "application/pdf") {
//             cb(null, true);
//         } else {
//             cb(new ApiError("only pdf allowed", 400), false);
//         }
//     };
//
//     return multer({storage: multerStorage, fileFilter: multerFilter});
// };
//
// exports.uploadFileDiskStorage = (fieldName) => {
//     const upload = multerOptions().single(fieldName);
//
//     return (req, res, next) => {
//         upload(req, res, (err) => {
//             if (err) {
//                 console.log(err);
//                 return next(new ApiError(err.message, 400));
//             }
//
//             // Ensure a file was uploaded
//             if (!req.file) {
//                 return next(new ApiError("No file uploaded", 400));
//             }
//
//             // Construct the full file URL
//             // Store it in req.body.pdfFile
//             req.body.pdfFile = req.file.path;
//
//             next();
//         });
//     };
// };

const multer = require("multer");

const ApiError = require("../utils/apiError");

const multerOptions = () => {
    const multerStorage = multer.diskStorage({
        destination: function (req, file, cb) {
            if (file.mimetype === "application/pdf") {
                cb(null, "uploads/products/pdfs");
            } else {
                cb(null, "uploads/products");
            }
        },
        filename: function (req, file, cb) {
            if (file.mimetype === "application/pdf") {
                const fileName = `${file.originalname}-${Date.now()}.pdf`;
                cb(null, fileName);
            } else {
                const ext = file.mimetype.split("/")[1];
                const fileName = `product-${Math.round(Math.random() * 1e9)}-${Date.now()}-cover.${ext}`;
                cb(null, fileName);
            }

        },
    });

    const multerFilter = function (req, file, cb) {
        if (file.mimetype.startsWith("image") || file.mimetype === "application/pdf") {
            cb(null, true);
        } else {
            cb(new ApiError("only image allowed", 400), false);
        }
    };

    return multer({storage: multerStorage, fileFilter: multerFilter});
};

const uploadSingleFile = (fieldName) => multerOptions().single(fieldName);

const uploadMixOfFile = (arrOfFields) => multerOptions().fields(arrOfFields);

module.exports = {uploadSingleFile, uploadMixOfFile};
