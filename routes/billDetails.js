var express = require("express");
var router = express.Router();

var BillDetail = require("../models/billDetail");

const JWT = require('jsonwebtoken');
const config = require("../utils/config-env");

/**
 * @swagger
 * /bill-details:
 *   get:
 *     summary: Get list of Bill detail
 *     tags: 
 *       - Bill Detail
 *     description: Retrieve a list of all Bill detail
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
 *                     
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
        const billDetails = await BillDetail.find().exec();
        res.status(200).json({
            status: true,
            data: billDetails,
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: `Failed: ${error.message}`,
        });
    }
});



module.exports = router;