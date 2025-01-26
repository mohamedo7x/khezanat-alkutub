const path = require("path");
const cron = require("node-cron")
const User = require('./src/models/userModel')
const dotenv = require("dotenv");
const dbConnection = require("./config/dbConnection");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const express = require("express");
const i18n = require('i18n');
const escapeHtml = require('escape-html');
const {rateLimit} = require('express-rate-limit');
const hpp = require('hpp');
const helmet = require('helmet');

const cloudinaryConnection = require("./config/cloudinaryConfig");
const mountRoutes = require("./src/routes");
const ApiError = require("./src/utils/apiError");
const globalError = require("./src/middlewares/globalErrorMiddleware");
const {setLocale} = require("./src/middlewares/setLocale");
const {localeConfig} = require("./config/localeConfig");
const {orderWebhookCheckout} = require("./src/controllers/orderController");

dotenv.config({path: "config/config.env",});

dbConnection();
const app = express();

localeConfig()
// Escape HTML middleware
app.use((req, res, next) => {
    if (req.body && typeof req.body === 'object') {
        for (const key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = escapeHtml(req.body[key]);
            }
        }
    }
    next();
});

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    // store: ... , // Redis, Memcached, etc. See below.
})

// Apply the rate limiting middleware to all requests.
app.use(limiter)

app.use(express.urlencoded({extended: true, limit: "40mb"}));
app.use(express.json({limit: "40mb"}));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cors());
app.use(hpp());
app.use(compression());
app.use(helmet());
app.use(helmet.xssFilter());

app.use(i18n.init);
app.use(setLocale);

cloudinaryConnection();

if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"));
    console.log(`mode: ${process.env.NODE_ENV}`);
}

app.post("/order-webhook-checkout", express.raw({type: 'application/json'}), orderWebhookCheckout);
app.use((err, req, res, next) => {
    if (err.type === 'entity.too.large') {
        return next(new ApiError('Payload exceeds 40 MB limit', 413))
    }
    next();
});

app.use((req, res, next) => {
    if (req.body.phone) {
        req.body.phone = req.body.phone.replace(/\s+/g, '');
    }
    next();
});
mountRoutes(app);

app.get("/api/v1", (req, res) => {
    res.send(`<h1>Welcome In Khezanat Alkutub App</h1>`);
});
cron.schedule('*/60 * * * *' , async()=>{
    const twoMinutesAgo = new Date(Date.now() - 60 * 60 * 1000); 
    await User.deleteMany({
        accountActive:false,
        createdAt :{$lte : twoMinutesAgo }
    });
    
})
app.all("*", (req, res, next) => {
    next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

app.use(globalError);

const PORT = process.env.PORT || 6000
const server = app.listen(PORT, () => {
    console.log(`App running on port ${PORT}`);
});

process.on("unhandledRejection", (error) => {
    console.error(`unhandledRejection Error: ${error.name} | ${error.message}`);
    server.close(() => {
        console.error(`shutting down...`);
        process.exit(1);
    });
});

module.exports = app