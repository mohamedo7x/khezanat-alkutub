const i18n = require("i18n");

exports.setLocale = (req, res, next) => {
    const lang = req.headers['lang'] || req.headers['accept-language'];
    i18n.setLocale(req, lang || 'ar');
    next();
}

exports.getLocale = (req) => i18n.getLocale(req);