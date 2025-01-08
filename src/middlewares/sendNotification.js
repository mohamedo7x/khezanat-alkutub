const admin = require('../../config/firebaseConfig');

exports.sendPushNotification = async (title, body, token) => {
    const message = {
        notification: {
            title: title,
            body: body,
        },
        token: token,
    };

    await admin.messaging().send(message);
}