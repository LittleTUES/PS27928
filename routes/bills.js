var express = require("express");
var router = express.Router();

var Bill = require("../models/bill");
var Product = require('../models/product')
var Cart = require('../models/cart')
var BillDetail = require('../models/billDetail'); // Đảm bảo đường dẫn đúng đến model của bạn

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
 *                           estimated:
 *                             type: string     
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
 * /bills/bill-details/add:
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
 *                 description: The ID of the bill
 *               product:
 *                 type: object
 *                 description: The product details
 *                 properties:
 *                   productId:
 *                     type: string
 *                     description: The ID of the product
 *                   name:
 *                     type: string
 *                     description: The name of the product
 *                   subcategory:
 *                     type: string
 *                     description: The subcategory of the product
 *                   price:
 *                     type: number
 *                     description: The price of the product
 *                   image:
 *                     type: string
 *                     description: The image URL of the product
 *               quantity:
 *                 type: number
 *                 description: The quantity of the product
 *               subtotal:
 *                 type: number
 *                 description: The subtotal for the product
 *     responses:
 *       '201':
 *         description: Bill detail created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   description: Indicates if the request was successful
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
router.post('/bill-details/add', async function (req, res) {
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
        if (savedBillDetail) {
            const productData = await Product.findById(product.productId);
            const newStock = productData.stock - quantity;
            await Product.findByIdAndUpdate(
                product.productId,
                { $set: { stock: newStock } },
                { new: true }
            );
            const billData = await Bill.findById(billId);
            await Cart.deleteOne({ userId: billData.user.userId, productId: product.productId });
        }
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


/**
 * @swagger
 * /bills/bill-details:
 *   get:
 *     summary: Get list of Bill details by Bill ID
 *     tags: 
 *       - Bill Detail
 *     description: Retrieve a list of all Bill details by Bill ID
 *     parameters:
 *       - in: query
 *         name: billId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the bill
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
 *                       billId:
 *                         type: string
 *                       product:
 *                         type: object
 *                         properties:
 *                           productId:
 *                             type: string
 *                           name:
 *                             type: string
 *                           subcategory:
 *                             type: string
 *                           price:
 *                             type: number
 *                           image:
 *                             type: string
 *                       quantity:
 *                         type: number
 *                       subtotal:
 *                         type: number
 *       '400':
 *         description: Invalid input
 *       '404':
 *         description: Bill details not found
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
router.get('/bill-details', async function (req, res) {
    const { billId } = req.query;

    if (!billId) {
        return res.status(400).json({
            status: false,
            message: 'Bill ID is required'
        });
    }

    try {
        // Tìm tất cả chi tiết hóa đơn theo billId
        const billDetails = await BillDetail.find({ billId }).exec();

        // Kiểm tra nếu không tìm thấy chi tiết hóa đơn
        if (!billDetails || billDetails.length === 0) {
            return res.status(404).json({
                status: false,
                message: 'No bill details found for the given Bill ID'
            });
        }

        res.status(200).json({
            status: true,
            data: billDetails,
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