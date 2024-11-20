var express = require("express");
var router = express.Router();

var Product = require("../models/product");
var Category = require("../models/category");

const JWT = require('jsonwebtoken');
const config = require("../utils/config-env");

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get list of products
 *     tags: 
 *       - Product
 *     description: Retrieve a list of all products
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
 *                       subcategory:
 *                         type: string
 *                       size:
 *                         type: string
 *                       price:
 *                         type: number
 *                       stock:
 *                         type: number
 *                       description:
 *                         type: string
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                       createdAt:
 *                         type: string
 *                       cateId:
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
        const products = await Product.find().exec();
        res.status(200).json({
            status: true,
            data: products,
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
 * /products/product-detail:
 *   get:
 *     summary: Get product details by product ID
 *     tags: 
 *       - Product
 *     description: Retrieve detailed information about a product, including its sizes
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the product
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
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     subcategory:
 *                       type: string
 *                     size:
 *                       type: string
 *                     price:
 *                       type: number
 *                     stock:
 *                       type: number
 *                     description:
 *                       type: string
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                     createdAt:
 *                       type: string
 *                     cateId:
 *                       type: string
 *       '404':
 *         description: Product not found
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
router.get('/product-detail', async (req, res) => {
    try {
        const productId = req.query.id;

        if (!productId) {
            return res.status(400).json({ status: false, message: "Product ID is required" });
        }
        const product = await Product.findById(productId).lean();
        if (!product) {
            return res.status(404).json({ status: false, message: 'Product not found' });
        }

        res.status(200).json({ status: true, data: product });
    } catch (error) {
        res.status(500).json({ status: false, message: "Failed: " + error });
    }
});

// /**
//  * @swagger
//  * /products/add:
//  *   post:
//  *     summary: Thêm sản phẩm mới
//  *     tags: 
//  *       - Products
//  *     security:
//  *       - bearerAuth: []
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             properties:
//  *               name:
//  *                 type: string
//  *                 example: example
//  *               image:
//  *                 type: string
//  *                 example: https://example.com/
//  *               description:
//  *                 type: string
//  *                 example: example
//  *               category:
//  *                 type: string
//  *                 example: 6706cd925944ac65d27646a2
//  *     responses:
//  *       '200':
//  *         description: Thêm sản phẩm thành công
//  *       '400':
//  *         description: Thất bại
//  *       '401':
//  *         description: Unauthorized
//  *       '403':
//  *         description: JWT hết hạn
//  */
// router.post('/add', async function (req, res) {
//     try {
//         const { name, image, description, category } = req.body;
//         const obj = await Category.findById(category);
//         if (obj) {
//             const itemAdd = { name, image, description, category };
//             await Product.create(itemAdd);
//             res.status(200).json({
//                 status: true,
//                 message: "Add product successful",
//                 data: itemAdd
//             });
//         } else {
//             return res.status(400).json({ status: false, message: "Category does not exist" });
//         }
//     } catch (err) {
//         res.status(400).json({ "status": 400, message: "Failed: " + err });
//     }
// });

/**
 * @swagger
 * /products/edit:
 *   put:
 *     summary: Thay đổi thông tin sản phẩm
 *     tags: 
 *       - Product
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 example: 6706ce735944ac65d27646aa
 *               name:
 *                 type: string
 *                 example: Black coffee
 *               image:
 *                 type: string
 *                 example: https://example.com/image.jpg
 *               description:
 *                 type: string
 *                 example: A rich black coffee
 *     responses:
 *       '200':
 *         description: Sửa sản phẩm thành công
 *       '400':
 *         description: Thất bại
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: JWT hết hạn
 */
router.put('/edit', async function (req, res) {
    try {
        const token = req.header("Authorization").split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (err, id) {
                if (err) {
                    res.status(403).json({ "status": 403, "err": err });
                } else {
                    const { id, name, image, description } = req.body;
                    var itemUpdate = await Product.findById(id);
                    if (itemUpdate) {
                        itemUpdate.name = name ? name : itemUpdate.name;
                        itemUpdate.price = image ? image : itemUpdate.image;
                        itemUpdate.image = description ? description : itemUpdate.description;
                        await itemUpdate.save();
                        res.status(200).json({
                            status: true,
                            message: "Edit product successful",
                            data: itemUpdate,
                        });
                    } else {
                        res.status(200).json({ status: false, message: "Product not found" });
                    }
                }
            });
        } else {
            res.status(401).json({ "status": 401, message: "Unauthorized" });
        }
    } catch (err) {
        res.status(400).json({ "status": 400, message: "Failed: " + err });
    }
});

/**
 * @swagger
 * /products/delete:
 *   delete:
 *     summary: Xóa sản phẩm
 *     tags: 
 *       - Product
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id của sản phẩm cần xóa
 *     responses:
 *       '200':
 *         description: Xoá sản phẩm thành công
 *       '400':
 *         description: Thất bại
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: JWT hết hạn
 *       '404':
 *         description: Không tìm thấy sản phẩm
 */
router.delete('/delete', async function (req, res) {
    try {
        const token = req.header("Authorization").split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (err, id) {
                if (err) {
                    res.status(403).json({ "status": 403, "err": err });
                } else {
                    const { id } = req.query;
                    const product = await Product.findByIdAndDelete(id);
                    if (product) {
                        res.status(200).json({
                            status: true,
                            message: "Deleted product successfully",
                            data: product
                        });
                    } else {
                        res.status(200).json({ status: false, message: "Product not found" });
                    }
                }
            });
        } else {
            res.status(401).json({ "status": 401, message: "Unauthorized" });
        }
    } catch (err) {
        res.status(400).json({ "status": 400, message: "Failed: " + err });
    }
});


module.exports = router;