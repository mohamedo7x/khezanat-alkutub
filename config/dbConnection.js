const {connect} = require("mongoose")

const dbConnection = () => {
    connect(process.env.MONGO_URL).then(connection => {
        console.log(`DB Connection: ${connection.connection.host}`);
    })
};

module.exports = dbConnection;