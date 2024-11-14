// utils/auth.js
const jwt = require('jsonwebtoken');
const config = require('./config-env'); // Đảm bảo bạn đã định nghĩa SECRETKEY

// Hàm tạo token đặt lại mật khẩu
const createResetToken = (userId) => {
    const resetToken = jwt.sign({ id: userId }, config.SECRETKEY, { expiresIn: '600000' }); // Token có hiệu lực 10 phút
    return resetToken;
};

module.exports = {
    createResetToken,
};
