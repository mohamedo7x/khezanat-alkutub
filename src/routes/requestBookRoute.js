const express = require("express");

const {
    uploadRequestBookImage,
    resizeRequestBookImage,
    createRequestBook,
    getRequestBooks,
    removeRequestBook,
} = require("../controllers/requestBookController");
const {
    createRequestBookValidation,
    removeRequestBookValidation,
} = require("../validations/requestBookValidation")
const validationMiddleware = require("../middlewares/validationMiddleware");
const verifyToken = require("../middlewares/verifyToken");
const {allowedToAdmins, allowedToUser, permissionValidate} = require("../middlewares/allowTo");

const router = express.Router();

router.use(verifyToken);

router.post("/",
    allowedToUser(), permissionValidate,
    uploadRequestBookImage, resizeRequestBookImage,
    createRequestBookValidation, validationMiddleware,
    createRequestBook,
);

router.get("/", allowedToAdmins("controlProduct"), permissionValidate, getRequestBooks);

router.delete("/:id",
    allowedToAdmins("controlProduct"), permissionValidate,
    removeRequestBookValidation, validationMiddleware,
    removeRequestBook,
);

module.exports = router;