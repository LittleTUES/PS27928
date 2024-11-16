var express = require("express");
var router = express.Router();

var Category = require("../models/category");
var productModel = require("../models/product");

const JWT = require('jsonwebtoken');
const config = require("../utils/config-env");

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get list of categories
 *     tags: 
 *       - Categories
 *     description: Retrieve a list of all categories
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
 *                       // thêm các thuộc tính của đối tượng sản phẩm tại đây
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.get('/', async function (req, res) {
    try {
        const categories = await Category.find().exec();
        res.status(200).json({
            status: true,
            data: categories,
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
 * /{categoryId}/products:
 *   get:
 *     summary: Get products by category ID
 *     tags: 
 *       - Products
 *     description: Retrieve a list of products based on category ID
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the category
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
 *                       description:
 *                         type: string
 *                       price:
 *                         type: number
 *                       category:
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
 *                 message:
 *                   type: string
 */
router.get('/:categoryId/products', async function (req, res) {
    try {
        const categoryId = req.params.categoryId;

        // Tìm các sản phẩm dựa trên ID danh mục
        var products = await productModel.find({ category: categoryId }).lean();
        res.status(200).json({
            status: true,
            data: products
        });
    } catch (err) {
        res.status(500).json({ status: false, message: "Failed: " + err });
    }
});


/**
 * @swagger
 * /categories/add:
 *   post:
 *     summary: Thêm loại sản phẩm mới
 *     tags: 
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Example
 *     responses:
 *       '200':
 *         description: Thêm loại sản phẩm thành công
 *       '400':
 *         description: Thất bại
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: JWT hết hạn
 */
router.post('/add', async function (req, res) {
    try {
        const token = req.header("Authorization").split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (err, id) {
                if (err) {
                    res.status(403).json({ status: 403, "err": err });
                } else {
                    const { name } = req.body;
                    const itemAdd = { name };
                    await Category.create(itemAdd);
                    res.status(200).json({
                        status: true,
                        message: "Add category successful",
                        data: itemAdd
                    });
                }
            });
        } else {
            res.status(401).json({ status: 401, message: "Unauthorized" });
        }
    } catch (err) {
        res.status(400).json({ status: 400, message: "Failed: " + err });
    }
});

/**
 * @swagger
 * /categories/edit:
 *   put:
 *     summary: Thay đổi thông tin loại sản phẩm
 *     tags: 
 *       - Categories
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
 *                 example: 6706cd925944ac65d27646a2
 *               name:
 *                 type: string
 *                 example: Coffee & Espresso
 *     responses:
 *       '200':
 *         description: Sửa loại sản phẩm thành công
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
                    res.status(403).json({ status: 403, "err": err });
                } else {
                    const { id, name } = req.body;
                    var itemUpdate = await Category.findById(id);
                    if (itemUpdate) {
                        itemUpdate.name = name ? name : itemUpdate.name;
                        await itemUpdate.save();
                        res.status(200).json({
                            status: true,
                            message: "Edit category successful",
                            data: itemUpdate,
                        });
                    } else {
                        res.status(200).json({ status: false, message: "Category not found" });
                    }
                }
            });
        } else {
            res.status(401).json({ status: 401, message: "Unauthorized" });
        }
    } catch (err) {
        res.status(400).json({ status: 400, message: "Failed: " + err });
    }
});

/**
 * @swagger
 * /categories/delete:
 *   delete:
 *     summary: Xóa loại sản phẩm
 *     tags: 
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Id của loại sản phẩm cần xóa
 *     responses:
 *       '200':
 *         description: Xoá loại sản phẩm thành công
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
                    res.status(403).json({ status: 403, "err": err });
                } else {
                    const { id } = req.query;
                    const itemDelete = await Category.findByIdAndDelete(id);
                    if (itemDelete) {
                        res.status(200).json({
                            status: true,
                            message: "Deleted category successfully",
                            data: itemDelete
                        });
                    } else {
                        res.status(200).json({ status: false, message: "Product not found" });
                    }
                }
            });
        } else {
            res.status(401).json({ status: 401, message: "Unauthorized" });
        }
    } catch (err) {
        res.status(400).json({ status: 400, message: "Failed: " + err });
    }
});

module.exports = router;
