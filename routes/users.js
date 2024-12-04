var express = require('express');
var router = express.Router();
const sendMail = require('../utils/config-nodemailer');
const User = require("../models/user");
const Cart = require("../models/cart");
const Product = require("../models/product");
const Bill = require("../models/bill");
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
 *       - User
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
        // const token = req.header("Authorization").split(' ')[1];
        // if (token) {
        //     JWT.verify(token, config.SECRETKEY, async function (err, id) {
        //         if (err) {
        //             res.status(403).json({ "status": 403, "err": err });
        //         } else {
        //xử lý chức năng tương ứng với API
        const users = await User.find().exec();
        res.status(200).json({ status: true, data: users });
        //     }
        // });
        // } else {
        //     res.status(401).json({ "status": 401, message: "Unauthorized" });
        // }
    } catch (error) {
        res.status(500).json({ status: false, message: error });
    }
});

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: User login
 *     tags: 
 *       - User
 *     description: User login with email and password, returning user data and their cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       '200':
 *         description: Log-in successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         phone:
 *                           type: string
 *                         address:
 *                           type: string
 *                     cart:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                           productId:
 *                             type: string
 *                           quantity:
 *                             type: number
 *       '400':
 *         description: Email and password are required
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
 *       '404':
 *         description: User not found
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
 *       '500':
 *         description: Log-in failed
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
                message: "Invalid email or Password . Try Again !"
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
 *       - User
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
 *       - User
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
 *       '404':
 *         description: Không tìm thấy người dùng
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
        res.status(200).json({ status: false, message: 'Password reset email sent' });
    } else {
        return res.status(404).json({ status: false, message: 'User not found' });
    }
});

/**
 * @swagger
 * /login/reset-password:
 *   post:
 *     summary: Đặt lại mật khẩu
 *     tags: 
 *       - User
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
 *       '400':
 *         description: Failed to reset password or token is invalid/expired
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

            res.status(200).json({ status: false, message: 'Password has been reset' });
        } else {
            return res.status(400).json({ status: false, message: 'Token is invalid or has expired' });
        }
    } catch (err) {
        res.status(400).json({ status: false, message: 'Failed to reset password: ' + err });
    }
});

/**
 * @swagger
 * /users/carts:
 *   get:
 *     summary: Get carts by user Id
 *     tags: 
 *       - Cart
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *     responses:
 *       '201':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       userId:
 *                         type: string
 *                       productId:
 *                         type: string
 *                       quantity:
 *                         type: number
 *       '400':
 *         description: Validation error
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
 *       '404':
 *         description: User not exist
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
 *       '500':
 *         description: Server error
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
 */
router.get('/carts', async (req, res) => {
    try {
        const userId = req.query.id;
        if (!userId) {
            return res.status(400).json({
                status: false,
                message: "User Id is required"
            });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not found"
            });
        }

        const carts = await Cart.find({ userId: userId });
        res.status(200).json({ status: true, data: carts });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Failed: ' + error.message });
    }
});

/**
 * @swagger
 * /users/carts/add:
 *   post:
 *     summary: Add or update cart
 *     tags: 
 *       - Cart
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: ID người dùng
 *               productId:
 *                 type: string
 *                 description: ID sản phẩm
 *               quantity:
 *                 type: number
 *                 description: Số lượng
 *                 example: 1
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     productId:
 *                       type: string
 *                     quantity:
 *                       type: number
 *       '400':
 *         description: Validation error
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
 *       '404':
 *         description: Not found error
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
 *       '500':
 *         description: Server error
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
 */
router.post('/carts/add', async function (req, res) {
    try {
        const { userId, productId, quantity } = req.body;

        // Kiểm tra xem người dùng có tồn tại không
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                status: false,
                message: "User not exist"
            });
        }

        // Kiểm tra xem sản phẩm có tồn tại không
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                status: false,
                message: "Product not exist"
            });
        }

        // Kiểm tra số lượng hợp lệ
        if (quantity < 1) {
            return res.status(400).json({
                status: false,
                message: "The quantity must be greater than 0"
            });
        }

        // Kiểm tra xem mục giỏ hàng đã tồn tại chưa
        let cart = await Cart.findOne({ userId, productId });
        if (cart) {
            // Nếu tồn tại, cập nhật số lượng
            cart.quantity += quantity;
            await cart.save();
        } else {
            // Nếu không tồn tại, tạo mục giỏ hàng mới
            cart = new Cart({ userId, productId, quantity });
            await cart.save();
        }

        res.status(201).json({
            status: true,
            data: cart,
        });
    } catch (err) {
        res.status(500).json({ status: false, message: "Failed: " + err.message });
    }
});

/**
 * @swagger
 * /users/bills/add:
 *   post:
 *     summary: Add a new Bill
 *     tags: 
 *       - Bill
 *     description: Add a new Bill to the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   address:
 *                     type: string
 *                   phone:
 *                     type: string
 *               paymentMethod:
 *                 type: string
 *               deliveryMethod:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   fee:
 *                     type: number
 *                   estimated:
 *                     type: string
 *     responses:
 *       '201':
 *         description: Bill created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *       '400':
 *         description: Invalid input
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
 *                   example: Invalid input
 *       '500':
 *         description: Server error
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
 */
router.post('/bills/add', async function (req, res) {
    const { user, paymentMethod, deliveryMethod } = req.body;

    // Kiểm tra các thuộc tính của user
    if (!user || !user.userId || !user.name || !user.email || !user.address || !user.phone) {
        return res.status(400).json({
            status: false,
            message: 'Invalid user input'
        });
    }

    // Kiểm tra các thuộc tính của deliveryMethod
    if (!deliveryMethod || !deliveryMethod.name || !deliveryMethod.fee || !deliveryMethod.estimated) {
        return res.status(400).json({
            status: false,
            message: 'Invalid delivery method input'
        });
    }

    // Kiểm tra paymentMethod
    if (!paymentMethod) {
        return res.status(400).json({
            status: false,
            message: 'Payment method is required'
        });
    }

    try {
        const newBill = await Bill.create({
            user,
            paymentMethod,
            deliveryMethod,
            status: true,
            createdAt: new Date(),
        });

        res.status(201).json({
            status: true,
            data: newBill
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed: ' + error.message,
        });
    }
});

module.exports = router;