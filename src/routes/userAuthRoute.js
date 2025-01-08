const express = require('express');

const {
    signup,
    verifyPhone,
    login,
    forgotPassword,
    verifyCode,
    resetPassword,
    resendCode,
} = require("../controllers/userAuthController");
const {
    signupValidator,
    verifyPhoneValidator,
    loginValidator,
    phoneValidator,
    verifyCodeValidator,
    resetPasswordValidator,
} = require("../validations/userAuthValidation");
const validationMiddleware = require("../middlewares/validationMiddleware")

const router = express.Router();

router.post("/signup",
    signupValidator,
    validationMiddleware,
    signup,
);

router.post("/verifyPhone",
    verifyPhoneValidator,
    validationMiddleware,
    verifyPhone,
);

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