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

module.exports = router;