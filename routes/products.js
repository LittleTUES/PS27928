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
 *                 status:
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
 *                     cateName:
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
        const category = await Category.findById(product.cateId);

        res.status(200).json({ status: true, data: { ...product, cateName: category.name } });
    } catch (error) {
        res.status(500).json({ status: false, message: "Failed: " + error });
    }
});

/**
 * @swagger
 * /products/recent-products:
 *   get:
 *     summary: Get recent products
 *     tags: 
 *       - Product
 *     description: Get products created within the last month, optionally filtered by category ID.
 *     parameters:
 *       - in: query
 *         name: cateId
 *         schema:
 *           type: string
 *         description: The ID of the category to filter products by.
 *     responses:
 *       '200':
 *         description: A list of recent products
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
 *                         description: The stock of the product
 *                         example: 20
 *                       description:
 *                         type: string
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       cateId:
 *                         type: string
 *       '400':
 *         description: Bad request
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
 *                   example: CateId is required
 *       '404':
 *         description: Not found
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
 *                   example: Category not found
 *       '500':
 *         description: Internal server error
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
router.get('/recent-products', async (req, res) => {
    try {
        const cateId = req.query.cateId;
        const threeMonthAgo = new Date();
        threeMonthAgo.setMonth(threeMonthAgo.getMonth() - 3);
        console.log('threeMonthAgo', threeMonthAgo);

        let recentProducts;

        if (cateId) {
            const category = await Category.findById(cateId);
            if (!category) {
                return res.status(404).json({ status: false, message: "Category not found" });
            }

            recentProducts = await Product.find({
                createdAt: { $gte: threeMonthAgo }, cateId: cateId
            });
        } else {
            recentProducts = await Product.find({
                createdAt: { $gte: threeMonthAgo }
            });
        }
        res.status(200).json({ status: true, data: recentProducts });
    } catch (error) {
        res.status(500).json({ status: false, message: "Failed: " + error });
    }
});

/**
 * @swagger
 * /products/{subcategory}:
 *   get:
 *     summary: Get products by subcategory
 *     tags: 
 *       - Product
 *     description: Retrieve products filtered by subcategory.
 *     parameters:
 *       - in: path
 *         name: subcategory
 *         schema:
 *           type: string
 *         description: The subcategory to filter products by.
 *         required: true
 *     responses:
 *       '200':
 *         description: A list of products filtered by subcategory
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
 *                         description: The stock of the product
 *                         example: 20
 *                       description:
 *                         type: string
 *                       images:
 *                         type: array
 *                         items:
 *                           type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       cateId:
 *                         type: string
 *       '400':
 *         description: Bad request
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
 *                   example: Subcategory is required
 *       '404':
 *         description: Not found
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
 *                   example: No products found for the given subcategory
 *       '500':
 *         description: Internal server error
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
router.get('/:subcategory', async (req, res) => {
    try {
        const { subcategory } = req.params;

        if (!subcategory) {
            return res.status(400).json({ status: false, message: "Subcategory is required" });
        }
        const products = await Product.find({ subcategory: subcategory });
        if (products.length === 0) {
            return res.status(404).json({ status: false, message: "No products found for the given subcategory" });
        }
        res.status(200).json({ status: true, data: products });
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