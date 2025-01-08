const {https} = require('follow-redirects');

exports.sendSMSInfobip = async (messageData) => {
    const options = {
        'method': 'POST',
        'hostname': process.env.HOSTNAME_INFOBIP,
        'path': '/sms/2/text/advanced',
        'headers': {
            'Authorization': `App ${process.env.API_KEY_INFOBIP}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        'maxRedirects': 20
    };

    const req = https.request(options, function (res) {
        let chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function (chunk) {
        });

        res.on("error", function (error) {
        });
    });

    const postData = JSON.stringify(messageData);

    req.write(postData);

    req.end();
}