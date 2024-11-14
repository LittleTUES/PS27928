const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: 'tientqps27928@fpt.edu.vn',
        pass: 'mqrtasxhqeqktbwr'
    }
});

// Hàm gửi email đặt lại mật khẩu

// Hàm gửi email đặt lại mật khẩu
const sendPasswordResetEmail = async (email, name, resetToken) => {
    const mailOptions = {
        from: 'tientqps27928@fpt.edu.vn', // Thay bằng email của bạn
        to: email,
        subject: 'Password Reset',
        html: `
        <h1>Password Reset</h1>
        <p>Hello ${name},</p>
        <p>You recently attempted to make an important change to your account that requires extra verification. To complete your request, please enter the following code when prompted:</p>
        <div style="width: 100%, letter-spacing: 5px">
            ${resetToken}
        </div>`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Password reset email sent');
    } catch (error) {
        console.error('Error sending email: ', error);
    }
};

module.exports = { transporter, sendPasswordResetEmail };
