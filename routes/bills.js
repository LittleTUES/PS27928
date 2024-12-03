var express = require("express");
var router = express.Router();

var Bill = require("../models/bill");
const BillDetail = require('../models/billDetail'); // Đảm bảo đường dẫn đúng đến model của bạn

/**
 * @swagger
 * /bills:
 *   get:
 *     summary: Get list of bill
 *     tags: 
 *       - Bill
 *     description: Retrieve a list of all bill
 *     responses:
 *       '200':
 *         description: Successful operation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                       status:
 *                         type: boolean
 *                       user:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           address:
 *                             type: string
 *                           phone:
 *                             type: string
 *                       paymentId:
 *                         type: string
 *                       deliveryMethod:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           fee:
 *                             type: number        
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
router.get('/', async function (req, res) {
    try {
        const bills = await Bill.find().exec();
        res.status(200).json({
            status: true,
            data: bills,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed:' + error.message,
        });
    }
});

/**
 * @swagger
 * /bills/add:
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
 *               paymentId:
 *                 type: string
 *               deliveryMethod:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   fee:
 *                     type: number
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
router.post('/add', async function (req, res) {
    const { user, paymentId, deliveryMethod } = req.body;

    // Kiểm tra đầu vào
    if (!user || !paymentId || !deliveryMethod) {
        return res.status(400).json({
            status: false,
            message: 'Invalid input'
        });
    }

    try {
        // Tạo mới Bill
        const newBill = await Bill.create({
            user,
            paymentId,
            deliveryMethod,
            status: true, // Bạn có thể thay đổi giá trị này theo yêu cầu
            createdAt: new Date(), // Tự động thêm thời gian tạo
        });

        res.status(201).json({
            status: true,
            data: {
                _id: newBill._id
            }
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed: ' + error.message,
        });
    }
});

/**
 * @swagger
 * /bills/bill-detail/add:
 *   post:
 *     summary: Add a new Bill detail
 *     tags: 
 *       - Bill Detail
 *     description: Add a new Bill detail to the database
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               billId:
 *                 type: string
 *               product:
 *                 type: object
 *                 properties:
 *                   productId:
 *                     type: string
 *                   name:
 *                     type: string
 *                   subcategory:
 *                     type: string
 *                   price:
 *                     type: number
 *                   image:
 *                     type: string
 *               quantity:
 *                 type: number
 *               subtotal:
 *                 type: number
 *     responses:
 *       '201':
 *         description: Bill detail created successfully
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
 *                     billId:
 *                       type: string
 *                     product:
 *                       type: object
 *                       properties:
 *                         productId:
 *                           type: string
 *                         name:
 *                           type: string
 *                         subcategory:
 *                           type: string
 *                         price:
 *                           type: number
 *                         image:
 *                           type: string
 *                     quantity:
 *                       type: number
 *                     subtotal:
 *                       type: number
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
router.post('/bill-detail/add', async function (req, res) {
    const { billId, product, quantity, subtotal } = req.body;

    // Kiểm tra đầu vào
    if (!billId || !product || !quantity || !subtotal) {
        return res.status(400).json({
            status: false,
            message: 'Invalid input'
        });
    }

    try {
        // Tạo mới Bill detail
        const newBillDetail = {
            billId,
            product,
            quantity,
            subtotal
        };
        // Lưu vào cơ sở dữ liệu
        const savedBillDetail = await BillDetail.create(newBillDetail);
        res.status(201).json({
            status: true,
            data: savedBillDetail
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed: ' + error.message,
        });
    }
});


// /**
//  * @swagger
//  * /carts/update:
//  *   put:
//  *     summary: Update product quantity in cart
//  *     tags: 
//  *       - Cart
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               userId:
//  *                 type: string
//  *                 description: ID of the user
//  *               productId:
//  *                 type: string
//  *                 description: ID of the product
//  *               quantity:
//  *                 type: integer
//  *                 description: Quantity of the product
//  *     responses:
//  *       '204':
//  *         description: Successful operation
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: boolean
//  *                   example: true
//  *                 message:
//  *                   type: string
//  *                   example: Product updated successfully
//  *       '400':
//  *         description: Missing required information
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: boolean
//  *                   example: false
//  *                 message:
//  *                   type: string
//  *                   example: Missing productId, userId, or quantity
//  *       '404':
//  *         description: Product not found in cart
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: boolean
//  *                   example: false
//  *                 message:
//  *                   type: string
//  *                   example: Product not found in cart
//  *       '500':
//  *         description: Server error
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 status:
//  *                   type: boolean
//  *                   example: false
//  *                 message:
//  *                   type: string
//  *                   example: Error updating product
//  */
// router.put('/update', async (req, res) => {
//     try {
//         const { productId, userId, quantity } = req.body; // Lấy thông tin từ body của request

//         if (!productId || !userId || quantity === undefined) {
//             return res.status(400).json({ status: false, message: 'Missing productId, userId, or quantity' });
//         }

//         const result = await Bill.findOneAndUpdate(
//             { userId: userId, productId: productId },
//             { $set: { quantity: quantity } }, // Cập nhật số lượng sản phẩm
//             { new: true } // Trả về document đã được cập nhật
//         );

//         if (!result) {
//             return res.status(404).json({ status: false, message: 'Product not found in cart' });
//         }

//         res.status(204).json({ status: true, message: 'Product updated successfully' });
//     } catch (error) {
//         res.status(500).json({ status: false, message: error.message });
//     }
// });




module.exports = router;