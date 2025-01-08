const express = require("express");

const {getAnalysisDashboard, getDiagramsProducts} = require("../controllers/dashboardController");
const {getAnalysisDashboardValidation} = require("../validations/dashboardValidation")
const validationMiddleware = require("../middlewares/validationMiddleware");
const verifyToken = require("../middlewares/verifyToken");
const {allowedToAdmins, permissionValidate} = require("../middlewares/allowTo");

const router = express.Router();

router.use(verifyToken, allowedToAdmins("controlAdmins", "controlUsers", "controlAuthor", "controlCategory", "controlProduct", "controlOrder", "controlApp"), permissionValidate);

router.get('/analysis', getAnalysisDashboardValidation, validationMiddleware, getAnalysisDashboard);

router.get('/diagram', getDiagramsProducts);

module.exports = router;