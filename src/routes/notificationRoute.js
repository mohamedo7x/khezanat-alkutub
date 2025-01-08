const express = require('express');
const {
    sendNotification,
    getUserNotifications,
    markNotificationAsRead,
} = require('../controllers/notificationController');
const {
    sendNotificationValidator,
    getNotificationsValidator,
    markNotificationAsReadValidator,
} = require('../validations/notificationValidation');
const validationResultMiddleware = require('../middlewares/validationMiddleware');
const verifyToken = require("../middlewares/verifyToken");
const {allowedToAdmins, allowedToUser, permissionValidate} = require("../middlewares/allowTo");

const router = express.Router();

router.use(verifyToken);

router.post('/',
    allowedToAdmins("controlApp"), permissionValidate,
    sendNotificationValidator, validationResultMiddleware,
    sendNotification,
);

router.get('/:userId',
    getNotificationsValidator,
    validationResultMiddleware,
    getUserNotifications
);

router.patch(
    '/:userId',
    markNotificationAsReadValidator,
    validationResultMiddleware,
    markNotificationAsRead
);

module.exports = router;
