exports.getRequestLang = (req)=> {
    let lang = req.headers['lang'] || req.headers['accept-language'];
    return lang || 'en';
}