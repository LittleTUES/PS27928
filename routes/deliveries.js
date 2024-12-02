var express = require("express");
var router = express.Router();

var Delivery = require("../models/delivery");

const JWT = require('jsonwebtoken');
const config = require("../utils/config-env");

/**
 * @swagger
 * /deliveries:
 *   get:
 *     summary: Get all delivery methods
 *     tags: 
 *       - Delivery
 *     description: Retrieve a list of all delivery methods
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
 *                       fee:
 *                         type: number
 *                       deliveryRange:
 *                         type: array
 *                         items:
 *                           type: number
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
        const deliveries = await Delivery.find().exec();
        res.status(200).json({
            status: true,
            data: deliveries,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed:' + error.message
        });
    }
});

module.exports = router;