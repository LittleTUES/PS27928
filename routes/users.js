var express = require('express');
var router = express.Router();
const sendMail = require('../utils/config-nodemailer');
const User = require("../models/user");
const Cart = require("../models/cart");
const { createResetToken } = require('../utils/auth');
const JWT = require('jsonwebtoken');
const config = require("../utils/config-env");
const { body, validationResult } = require('express-validator');

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
                    var list = await User.find();
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
 *                 description: Email của người dùng
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 description: Mật khẩu của người dùng
 *                 example: password123
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *       400:
 *         description: Thiếu email hoặc mật khẩu
 *       404:
 *         description: Tài khoản không tồn tại
 *       500:
 *         description: Lỗi máy chủ
 */
router.post('/login', async function (req, res) {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                status: false,
                message: "Email and password are required"
            });
        }

        const checkUser = await User.findOne({ email: email, password: password });
        if (!checkUser) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }
        const userCart = await Cart.find({ userId: checkUser._id }).lean();
        res.status(200).json({
            status: true,
            data: {
                user: checkUser,
                cart: userCart
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: "Log-in failed: " + error
        });
    }
});


/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Đăng ký người dùng mới
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
 *                 description: Tên của người dùng
 *                 example: johnDoe123
 *               email:
 *                 type: string
 *                 description: Email của người dùng
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 description: Số điện thoại của người dùng
 *                 example: "0123456789"
 *               password:
 *                 type: string
 *                 description: Mật khẩu của người dùng
 *                 example: password123
 *     responses:
 *       '201':
 *         description: Tạo tài khoản thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Create account successful
 *       '400':
 *         description: Yêu cầu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       type:
 *                         type: string
 *                         example: field
 *                       value:
 *                         type: string
 *                         example: johnDoe123
 *                       msg:
 *                         type: string
 *                         example: Invalid email format
 *                       path:
 *                         type: string
 *                         example: email
 *                       location:
 *                         type: string
 *                         example: body
 *       '409':
 *         description: Xung đột dữ liệu (email hoặc số điện thoại đã tồn tại)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Email or phone number already exists
 *       '500':
 *         description: Lỗi máy chủ nội bộ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Failed: Internal Server Error"
 */
router.post('/register', [
    body('name').notEmpty().withMessage('Name is required').isAlphanumeric().withMessage('Name must not contain special characters'),
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Invalid email format'),
    body('phone').notEmpty().withMessage('Phone is required').isNumeric().withMessage('Phone must contain only numbers').isLength({ min: 10, max: 10 }).withMessage('Phone must be exactly 10 digits'),
    body('password').notEmpty().withMessage('Password is required')
], async function (req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ status: false, message: 'Validation failed', errors: errors.array() });
    }

    try {
        const { name, email, phone, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ email: email }, { phone: phone }] });
        if (existingUser) {
            return res.status(409).json({
                status: false,
                message: 'Email or phone number already exists'
            });
        }

        const account = { name, email, phone, password };
        await User.create(account);
        res.status(201).json({
            status: true,
            message: "Create account successful",
        });
    } catch (err) {
        res.status(500).json({
            status: false,
            message: "Failed: " + err
        });
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
    const user = await User.findOne({ email });
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
        const user = await User.findOne({ _id: decoded.id, resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });
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