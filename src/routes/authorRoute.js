const express = require('express');

const {
    getAllAuthors,
    setProfileID,
    getAuthor,
    updateAuthor,
    // deleteAuthor,
    blockAuthor,
    activeAuthor,
    changePassword,
    uploadProfileImage,
    resizeAuthorProfileImage,
    updateProfileImage,
    search,
    addAddress,
    removeAddress,
    uploadAuthorFormProfileImage,
    resizeAuthorFormProfileImage,
    formCreateAuthor,
    confirmCreateAuthor,
    getAuthorForm,
    createNewAuthor,
} = require('../controllers/authorController')
const {
    getAuthorValidation,
    updateAuthorValidation,
    // deleteAuthorValidation,
    blockAuthorValidation,
    searchValidation,
    changeAuthorPasswordValidation,
    addAddressValidation,
    removeAddressValidation,
    formCreateAuthorValidator,
    confirmCreateAuthorValidation,
    createNewAuthorValidator,
    activeAuthorValidation,
} = require('../validations/authorValidation');
const validationMiddleware = require("../middlewares/validationMiddleware");
const verifyToken = require("../middlewares/verifyToken");
const {allowedToAuthor, allowedToAdmins, permissionValidate} = require("../middlewares/allowTo")

const router = express.Router();

router.get('/', getAllAuthors);

router.get("/getAuthor/:id",  getAuthorValidation, validationMiddleware, getAuthor);

router.post("/formAuthor",
    uploadAuthorFormProfileImage,
    resizeAuthorFormProfileImage,
    formCreateAuthorValidator,
    validationMiddleware,
    formCreateAuthor,
);

router.get("/formAuthor", verifyToken, allowedToAdmins("controlAuthor"), permissionValidate, getAuthorForm);

router.use(verifyToken);

router.get("/getProfile",
    allowedToAuthor(),
    permissionValidate,
    setProfileID,
    getAuthor,
);

router.patch("/updateProfile",
    allowedToAuthor(),
    permissionValidate,
    setProfileID,
    updateAuthorValidation,
    validationMiddleware,
    updateAuthor,
);

router.patch("/updateImage",
    allowedToAuthor(),
    permissionValidate,
    setProfileID,
    uploadProfileImage,
    resizeAuthorProfileImage,
    updateProfileImage,
);

// router.delete("/deleteProfile",
//     allowedToAuthor(),
//     permissionValidate,
//     setProfileID,
//     deleteAuthor,
// );

router.patch("/changePassword",
    allowedToAuthor(),
    permissionValidate,
    changeAuthorPasswordValidation,
    validationMiddleware,
    changePassword,
);

router.post("/address",
    allowedToAuthor(),
    permissionValidate,
    addAddressValidation,
    validationMiddleware,
    addAddress,
);

router.delete("/address/:addressId",
    allowedToAuthor(),
    permissionValidate,
    removeAddressValidation,
    validationMiddleware,
    removeAddress,
);

router.use(
    allowedToAdmins("controlAuthor"),
    permissionValidate,
)


router.get("/search",
    searchValidation,
    validationMiddleware,
    search,
)

router.route("/:id")
    .patch(updateAuthorValidation, validationMiddleware, updateAuthor)
// .delete(deleteAuthorValidation, validationMiddleware, deleteAuthor);

router.patch("/blockAuthor/:id", blockAuthorValidation, validationMiddleware, blockAuthor);

router.patch("/activeAuthor/:id", activeAuthorValidation, validationMiddleware, activeAuthor);

router.delete("/formAuthor/:id", confirmCreateAuthorValidation, validationMiddleware, confirmCreateAuthor);

router.post("/createAuthor", createNewAuthorValidator, validationMiddleware, createNewAuthor)

module.exports = router