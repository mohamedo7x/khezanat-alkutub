const path = require("path");

const i18n = require("i18n");

exports.localeConfig = () => {
    i18n.configure({
        locales: ['en', 'ar', 'zh', 'id'], // Supported languages
        directory: path.join(__dirname, '../locale/'), // Directory for JSON files with translations
        defaultLocale: 'ar', // Default language
        cookie: 'locale', // Cookie name for storing language preference
    });
}