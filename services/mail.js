const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'jfga1508@gmail.com',
        pass: 'fera nfre ftea ooym',
    },
});

module.exports = { transporter };
