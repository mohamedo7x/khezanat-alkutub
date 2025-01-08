const apiSuccess = (message, code, data) => {
    return {
        status: "success",
        code,
        message,
        data
    }
};


module.exports = apiSuccess;