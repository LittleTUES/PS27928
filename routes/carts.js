var express = require("express");
var router = express.Router();

var Cart = require("../models/cart");
var Product = require("../models/product");
var Category = require("../models/category");

const JWT = require('jsonwebtoken');
const config = require("../utils/config-env");

/**
 * @swagger
 * /carts:
 *   get:
 *     summary: Get list of products
 *     tags: 
 *       - Cart
 *     description: Retrieve a list of all cart
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
 *                       userId:
 *                         type: string
 *                       productId:
 *                         type: string
 *                       quantity:
 *                         type: number
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
        const carts = await Cart.find().exec();
        res.status(200).json({
            status: true,
            data: carts,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: `Failed: ${error.message}`,
        });
    }
});

/**
 * @swagger
 * /carts/delete:
 *   delete:
 *     summary: Delete product from cart
 *     tags: 
 *       - Cart
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product
 *     responses:
 *       '204':
 *         description: Successful operation
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
 *                   example: Product deleted successfully
 *       '404':
 *         description: Product not found in cart
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
 *                   example: Product not found in cart
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
 *                   example: Error deleting product
 */
router.delete('/delete', async (req, res) => {
    try {
        const { productId, userId } = req.query;
        const result = await Cart.deleteOne({ userId: userId, productId: productId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ status: false, message: 'Product not found in cart' });
        }
        res.status(204).json({ status: true, message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});

/**
 * @swagger
 * /carts/update:
 *   put:
 *     summary: Update product quantity in cart
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
 *                 description: ID of the user
 *               productId:
 *                 type: string
 *                 description: ID of the product
 *               quantity:
 *                 type: integer
 *                 description: Quantity of the product
 *     responses:
 *       '204':
 *         description: Successful operation
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
 *                   example: Product updated successfully
 *       '400':
 *         description: Missing required information
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
 *                   example: Missing productId, userId, or quantity
 *       '404':
 *         description: Product not found in cart
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
 *                   example: Product not found in cart
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
 *                   example: Error updating product
 */
router.put('/update', async (req, res) => {
    try {
        const { productId, userId, quantity } = req.body; // Lấy thông tin từ body của request

        if (!productId || !userId || quantity === undefined) {
            return res.status(400).json({ status: false, message: 'Missing productId, userId, or quantity' });
        }

        const result = await Cart.findOneAndUpdate(
            { userId: userId, productId: productId },
            { $set: { quantity: quantity } }, // Cập nhật số lượng sản phẩm
            { new: true } // Trả về document đã được cập nhật
        );

        if (!result) {
            return res.status(404).json({ status: false, message: 'Product not found in cart' });
        }

        res.status(204).json({ status: true, message: 'Product updated successfully' });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
});




module.exports = router;