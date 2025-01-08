const adminRoute = require("./adminRoute");
const userAuthRoute = require("./userAuthRoute");
const userRoute = require("./userRoute");
const subscriptionRoute = require("./subscriptionRoute");
const userWishlistRoute = require("./userWishlistRoute");
const authorAuthRoute = require("./authorAuthRoute");
const authorRoute = require("./authorRoute");
const authorWishlistRoute = require("./authorWishlistRoute");
const categoryRoute = require("./categoryRoute");
const productRoute = require("./productRoute");
const requestBookRoute = require("./requestBookRoute");
const cartRoute = require("./cartRoute");
const orderRoute = require("./orderRoute");
const appControlRoute = require("./appControlRoute");
const notificationRoute = require("./notificationRoute");
const dashboardRoute = require("./dashboardRoute");

const mountRoutes = (app) => {
    app.use('/api/v1/admin', adminRoute);
    app.use('/api/v1/userAuth', userAuthRoute);
    app.use('/api/v1/user', userRoute);
    app.use('/api/v1/subscription', subscriptionRoute);
    app.use('/api/v1/userWishlist', userWishlistRoute);
    app.use('/api/v1/authorAuth', authorAuthRoute);
    app.use('/api/v1/author', authorRoute);
    app.use('/api/v1/authorWishlist', authorWishlistRoute);
    app.use('/api/v1/category', categoryRoute);
    app.use('/api/v1/product', productRoute);
    app.use('/api/v1/requestBook', requestBookRoute);
    app.use('/api/v1/cart', cartRoute);
    app.use('/api/v1/order', orderRoute);
    app.use('/api/v1/app', appControlRoute);
    app.use('/api/v1/notification', notificationRoute);
    app.use('/api/v1/dashboard', dashboardRoute);
}

module.exports = mountRoutes;