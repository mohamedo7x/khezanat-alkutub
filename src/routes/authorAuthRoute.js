const express = require('express');

const {
    // createAuthor,
    // verifyPhone,
    login,
    forgotPassword,
    verifyCode,
    resetPassword,
    resendCode,
} = require("../controllers/authorAuthController");
const {
    // createAuthorValidator,
    // verifyPhoneValidator,
    loginValidator,
    phoneValidator,
    verifyCodeValidator,
    resetPasswordValidator,
} = require("../validations/authorAuthValidation");
const validationMiddleware = require("../middlewares/validationMiddleware")
// const verifyToken = require("../middlewares/verifyToken");
// const {allowedToAdmins, permissionValidate} = require("../middlewares/allowTo")

const router = express.Router();

// router.post("/createAuthor",
//     verifyToken,
//     allowedToAdmins("controlAuthor"),
//     permissionValidate,
//     createAuthorValidator,
//     validationMiddleware,
//     createAuthor,
// );

// router.post("/verifyPhone",
//     verifyPhoneValidator,
//     validationMiddleware,
//     verifyPhone,
// );

router.post("/login",
    loginValidator,
    validationMiddleware,
    login,
);

router.post("/forgotPassword",
    phoneValidator,
    validationMiddleware,
    forgotPassword,
);

router.post("/verifyCode",
    verifyCodeValidator,
    validationMiddleware,
    verifyCode,
);

router.patch("/resetPassword",
    resetPasswordValidator,
    validationMiddleware,
    resetPassword,
);

router.post("/resendCode",
    phoneValidator,
    validationMiddleware,
    resendCode,
);

module.exports = router