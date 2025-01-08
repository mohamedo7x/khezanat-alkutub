const express = require('express');

const {
    getAllUsers,
    setProfileID,
    getUser,
    updateUser,
    // deleteUser,
    blockUser,
    changePassword,
    uploadProfileImage,
    resizeAuthorProfileImage,
    updateProfileImage,
    search,
    subscribeAccount,
    unsubscribeAccount,
    addAddress,
    removeAddress,
    mainAddress, activeUser,
} = require('../controllers/userController')
const {
    getUserValidation,
    updateUserValidation,
    // deleteUserValidation,
    searchValidation,
    changeUserPasswordValidation,
    subscribeValidation,
    addAddressValidation,
    addressValidation,
    blockUserValidation, activeUserValidation,
} = require('../validations/userValidation');
const validationMiddleware = require("../middlewares/validationMiddleware");
const verifyToken = require("../middlewares/verifyToken");
const {allowedToUser, allowedToAdmins, permissionValidate} = require("../middlewares/allowTo")

const router = express.Router();

router.use(verifyToken);

router.get("/getProfile",
    allowedToUser(),
    permissionValidate,
    setProfileID,
    getUser,
);

router.route("/subscribe/:subscriptionId")
    .post(allowedToUser(), permissionValidate, subscribeValidation, validationMiddleware, subscribeAccount)
    .delete(allowedToUser(), permissionValidate, subscribeValidation, validationMiddleware, unsubscribeAccount)

router.patch("/updateProfile",
    allowedToUser(),
    permissionValidate,
    setProfileID,
    updateUserValidation,
    validationMiddleware,
    updateUser,
);

router.patch("/updateImage",
    allowedToUser(),
    permissionValidate,
    setProfileID,
    uploadProfileImage,
    resizeAuthorProfileImage,
    updateProfileImage,
);

// router.delete("/deleteProfile",
//     allowedToUser(),
//     permissionValidate,
//     setProfileID,
//     deleteUser,
// );

router.patch("/changePassword",
    allowedToUser(),
    permissionValidate,
    changeUserPasswordValidation,
    validationMiddleware,
    changePassword,
);

router.post("/address",
    allowedToUser(),
    permissionValidate,
    addAddressValidation,
    validationMiddleware,
    addAddress,
);

router.route("/address/:addressId")
    .post(allowedToUser(), permissionValidate, addressValidation, validationMiddleware, mainAddress)
    .delete(allowedToUser(), permissionValidate, addressValidation, validationMiddleware, removeAddress);

router.use(
    allowedToAdmins("controlUsers"),
    permissionValidate,
)

router.get('/', getAllUsers);

router.get("/search",
    searchValidation,
    validationMiddleware,
    search,
)

router.route("/:id")
    .get(getUserValidation, validationMiddleware, getUser)
    .patch(updateUserValidation, validationMiddleware, updateUser)
    // .delete(deleteUserValidation, validationMiddleware, deleteUser);

router.patch("/blockUser/:id", blockUserValidation, validationMiddleware, blockUser);

router.patch("/activeUser/:id", activeUserValidation, validationMiddleware, activeUser);

module.exports = router

// admin: getAllUsers - getUser - updateUser - deleteUser - search
// user: getProfile - updateProfile - deleteProfile - changePassword - updateProfileImage