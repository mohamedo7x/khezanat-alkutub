const express = require("express");

const {
    addSubscriptionPlan,
    getSubscriptionPlans,
    updateSubscriptionPlan,
    deleteSubscriptionPlan,
} = require("../controllers/subscriptionController");
const {
    addSubscriptionPlanValidation,
    updateSubscriptionPlanValidation,
    deleteSubscriptionPlanValidation,
} = require("../validations/subscribtionValidation")
const validationMiddleware = require("../middlewares/validationMiddleware");
const verifyToken = require("../middlewares/verifyToken");
const {allowedToAdmins, permissionValidate, allowedToUser} = require("../middlewares/allowTo");

const router = express.Router();

router.get("/", getSubscriptionPlans)

router.use(verifyToken, allowedToAdmins("controlUsers"), permissionValidate);

router.post("/", addSubscriptionPlanValidation, validationMiddleware, addSubscriptionPlan)

router.route("/:id")
    .patch(updateSubscriptionPlanValidation, validationMiddleware, updateSubscriptionPlan)
    .delete(deleteSubscriptionPlanValidation, validationMiddleware, deleteSubscriptionPlan)

module.exports = router;