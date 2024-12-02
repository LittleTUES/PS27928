var express = require("express");
var router = express.Router();

var Payment = require("../models/payment");

const JWT = require('jsonwebtoken');
const config = require("../utils/config-env");

/**
 * @swagger
 * /payments:
 *   get:
 *     summary: Get all payment methods
 *     tags: 
 *       - Payment
 *     description: Retrieve a list of all payment methods
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
 *                       name:
 *                         type: string
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
        const payments = await Payment.find().exec();
        res.status(200).json({
            status: true,
            data: payments,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed:' + error.message
        });
    }
});

module.exports = router;