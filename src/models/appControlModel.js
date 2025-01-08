const mongoose = require("mongoose")

const appControlSchema = new mongoose.Schema({
    app: {
        type: String,
        default: 'khezanatalkutub'
    },

    privacyPolicy: {
        ar: {
            type: String,
            trim: true,
        },
        en: {
            type: String,
            trim: true,
        },
        id: {
            type: String,
            trim: true,
        },
        zh: {
            type: String,
            trim: true,
        },
    },
    termsAndConditions: {
        ar: {
            type: String,
            trim: true,
        },
        en: {
            type: String,
            trim: true,
        },
        id: {
            type: String,
            trim: true,
        },
        zh: {
            type: String,
            trim: true,
        },
    },
    author: {
        salesPercentage: Number,
    },
    homeBanner: {
        title: {
            ar: {
                type: String,
                trim: true,
            },
            en: {
                type: String,
                trim: true,
            },
            id: {
                type: String,
                trim: true,
            },
            zh: {
                type: String,
                trim: true,
            },
        },
        image: String
    },
    cities: [
        {
            title: {
                ar: {
                    type: String,
                    trim: true,
                },
                en: {
                    type: String,
                    trim: true,
                },
                id: {
                    type: String,
                    trim: true,
                },
                zh: {
                    type: String,
                    trim: true,
                },
            },
            shippingPrice: Number,
        }
    ],
    aboutUs: {
        title: {
            ar: {
                type: String,
                trim: true,
            },
            en: {
                type: String,
                trim: true,
            },
            id: {
                type: String,
                trim: true,
            },
            zh: {
                type: String,
                trim: true,
            },
        },
        description: {
            ar: {
                type: String,
                trim: true,
            },
            en: {
                type: String,
                trim: true,
            },
            id: {
                type: String,
                trim: true,
            },
            zh: {
                type: String,
                trim: true,
            },
        },
        footerDescription: {
            ar: {
                type: String,
                trim: true,
            },
            en: {
                type: String,
                trim: true,
            },
            id: {
                type: String,
                trim: true,
            },
            zh: {
                type: String,
                trim: true,
            },
        },
        linkVideo: String,
        email: String,
        phone: String,
        location: {
            address: String,
            lat: String,
            lng: String,
        },
        workDate: {
            from: Number,
            to: Number,
        },
    },

    featureItems: [
        {
            title: {
                ar: {
                    type: String,
                    trim: true,
                },
                en: {
                    type: String,
                    trim: true,
                },
                id: {
                    type: String,
                    trim: true,
                },
                zh: {
                    type: String,
                    trim: true,
                },
            },
            subTitle: {
                ar: {
                    type: String,
                    trim: true,
                },
                en: {
                    type: String,
                    trim: true,
                },
                id: {
                    type: String,
                    trim: true,
                },
                zh: {
                    type: String,
                    trim: true,
                },
            },
            image: String,
        }
    ],
}, {timestamps: true});

const AppControlModel = mongoose.model("appControl", appControlSchema);

module.exports = AppControlModel;