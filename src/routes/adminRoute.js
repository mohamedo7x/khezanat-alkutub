const express = require('express');

const {
    uploadProfileImage,
    resizeAdminProfileImage,
    createAdmin,
    login,
    getAdmins,
    search,
    getAdmin,
    updateAdmin,
    deleteAdmin,
    setProfileID,
    updateProfile,
    updateImgProfile,
    changePassword
} = require('../controllers/adminController')
const {
    createAdminValidation,
    loginValidator,
    searchValidation,
    getAdminValidation,
    updateAdminValidation,
    deleteAdminValidation,
    updateProfileValidation,
    changeAdminPasswordValidation,
} = require('../validations/adminValidation');
const validationMiddleware = require("../middlewares/validationMiddleware");
const verifyToken = require("../middlewares/verifyToken");
const {allowedToAdmins, permissionValidate} = require("../middlewares/allowTo")

const router = express.Router();

router.post("/login",
    loginValidator,
    validationMiddleware,
    login,
);

router.get("/getProfile",
    verifyToken,
    allowedToAdmins("controlAdmins", "controlUsers", "controlCategory", "controlProduct", "controlOrder"),
    permissionValidate,
    setProfileID,
    getAdmin,
);

router.patch("/updateProfile",
    verifyToken,
    allowedToAdmins("controlAdmins", "controlUsers", "controlCategory", "controlProduct", "controlOrder"),
    permissionValidate,
    setProfileID,
    updateProfileValidation,
    validationMiddleware,
    updateProfile,
);

router.patch("/updateImgProfile",
    verifyToken,
    allowedToAdmins("controlAdmins", "controlUsers", "controlCategory", "controlProduct", "controlOrder"),
    permissionValidate,
    setProfileID,
    uploadProfileImage,
    resizeAdminProfileImage,
    updateImgProfile,
);

// router.delete("/deleteProfile",
//     verifyToken,
//     allowedToAdmins("controlAdmins", "controlUsers", "controlCategory", "controlProduct", "controlOrder"),
//     permissionValidate,
//     setProfileID,
//     deleteAdmin,
// );

router.patch("/changePassword",
    verifyToken,
    allowedToAdmins("controlAdmins", "controlUsers", "controlCategory", "controlProduct", "controlOrder"),
    permissionValidate,
    changeAdminPasswordValidation,
    validationMiddleware,
    changePassword,
);

router.use(
    verifyToken,
    allowedToAdmins("controlAdmins"),
    permissionValidate,
);

router.route("/")
    .get(getAdmins)
    .post(
        uploadProfileImage,
        resizeAdminProfileImage,
        createAdminValidation,
        validationMiddleware,
        createAdmin,
    );

router.get("/search",
    searchValidation,
    validationMiddleware,
    search,
);

router.route("/:id")
    .get(getAdminValidation, validationMiddleware, getAdmin)
    .patch(updateAdminValidation, validationMiddleware, updateAdmin)
    .delete(deleteAdminValidation, validationMiddleware, deleteAdmin);

module.exports = router
