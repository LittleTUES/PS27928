var express = require('express');
var router = express.Router();
var sendMail = require('../utils/config-nodemailer');
var userModel = require("../models/user");

const { createResetToken } = require('../utils/auth');
const JWT = require('jsonwebtoken');
const config = require("../utils/config-env");

/* GET users listing. */
// router.get('/', function(req, res, next) {
//   res.send('respond with a resource');
// });
/**
 * @swagger
 * /users:
 *   get:
 *     summary: Lấy danh sách tài khoản
 *     tags: 
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thành công trả về danh sách tài khoản
 *       400:
 *         description: Thất bại
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: JWT hết hạn
 */
router.get('/', async function (req, res) {
    try {
        const token = req.header("Authorization").split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (err, id) {
                if (err) {
                    res.status(403).json({ "status": 403, "err": err });
                } else {
                    //xử lý chức năng tương ứng với API
                    var list = await userModel.find();
                    res.status(200).json(list);
                }
            });
        } else {
            res.status(401).json({ "status": 401, message: "Unauthorized" });
        }
    } catch (err) {
        res.status(400).json({ "status": 400, message: "Failed" });
    }
});

/**
 * @swagger
 * /users/login/:
 *   post:
 *     summary: Đăng nhập tài khoản
 *     tags: 
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: example@example.com
 *               password:
 *                 type: string
 *                 example: example
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       400:
 *         description: Thất bại
 *       402:
 *         description: Tài khoản không tồn tại
 */
router.post('/login', async function (req, res) {
    try {
        const { email, password } = req.body;
        var checkUser = await userModel.findOne({ email: email, password: password });
        if (checkUser) {
            const token = JWT.sign({ id: email }, config.SECRETKEY, { expiresIn: '30s' });
            const refreshToken = JWT.sign({ id: email }, config.SECRETKEY, { expiresIn: '1h' });
            res.status(200).json({
                status: true,
                message: "Log-in successful",
                token: token,
                refreshToken: refreshToken
            });
        } else {
            res.status(402).json({
                status: false,
                message: "User not found"
            });
        }
    } catch (error) {
        res.status(400).json({ status: false, message: "Log-in failed: " + error });
    }
});

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Đăng ký tài khoản
 *     tags: 
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: example
 *               email:
 *                 type: string
 *                 example: example@example.com
 *               password:
 *                 type: string
 *                 example: example
 *     responses:
 *       200:
 *         description: Tạo tài khoản thành công
 *       400:
 *         description: Thất bại
 */
router.post('/register', async function (req, res) {
    try {
        const { name, email, password } = req.body;
        const account = { name, email, password };
        await userModel.create(account);
        res.status(200).json({
            status: true,
            message: "Create account successful",
            data: account
        });
    } catch (err) {
        res.status(400).json({ "status": 400, message: "Failed: " + err });
    }
});

/**
 * @swagger
 * /users/login/forgot-password:
 *   post:
 *     summary: Yêu cầu đặt lại mật khẩu
 *     tags: 
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: trinhquoctien26@gmail.com
 *     responses:
 *       '200':
 *         description: Email đặt lại mật khẩu đã được gửi
 *       '404':
 *         description: Không tìm thấy người dùng
 */
router.post('/login/forgot-password', async (req, res) => {
    const { email } = req.body;

    // Kiểm tra xem email có tồn tại không
    const user = await userModel.findOne({ email });
    if (user) {
        // Tạo token đặt lại mật khẩu
        const resetToken = createResetToken(user._id);
        // Lưu token vào cơ sở dữ liệu (tùy vào cơ sở dữ liệu của bạn)
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 600000; // 10 phút
        await user.save();
        // Gửi email đặt lại mật khẩu
        await sendMail.sendPasswordResetEmail(email, user.name, resetToken);
        res.status(200).json({ message: 'Password reset email sent' });
    } else {
        return res.status(404).json({ message: 'User not found' });
    }
});

/**
 * @swagger
 * /login/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu
 *     tags: 
 *       - Users
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: your_reset_token
 *               newPassword:
 *                 type: string
 *                 example: your_new_password
 *     responses:
 *       '200':
 *         description: Password has been reset
 *       '400':
 *         description: Failed to reset password or token is invalid/expired
 */
router.post('/login/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    try {
        // Xác minh token
        const decoded = JWT.verify(token, config.SECRETKEY);
        const user = await userModel.findOne({ _id: decoded.id, resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
        if (user) {
            // Cập nhật mật khẩu
            user.password = newPassword;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();

            res.status(200).json({ message: 'Password has been reset' });
        } else {
            return res.status(400).json({ message: 'Token is invalid or has expired' });
        }
    } catch (err) {
        res.status(400).json({ message: 'Failed to reset password: ' + err });
    }
});


module.exports = router;