var express = require("express");
var router = express.Router();

var categoryModel = require("../models/category");
var productModel = require("../models/product");

const JWT = require('jsonwebtoken');
const config = require("../utils/config-env");

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Lấy danh sách loại sản phẩm
 *     tags: 
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Thành công trả về danh sách loại sản phẩm
 *       '400':
 *         description: Thất bại
 *       '401':
 *         description: Không được phép
 *       '403':
 *         description: JWT đã hết hạn
 */
router.get('/', async function (req, res) {
    try {
        const token = req.header("Authorization").split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (err, id) {
                if (err) {
                    res.status(403).json({ "status": 403, "err": err });
                } else {
                    var list = await categoryModel.find();
                    res.status(200).json(list);
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
 * /categories/{categoryId}/products:
 *   get:
 *     summary: Lấy danh sách sản phẩm theo category
 *     tags: 
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của category
 *     responses:
 *       '200':
 *         description: Thành công trả về danh sách sản phẩm
 *       '400':
 *         description: Thất bại
 *       '401':
 *         description: Unauthorized
 *       '403':
 *         description: JWT expired
 */
router.get('/:categoryId/products', async function (req, res) {
    try {
        const token = req.header("Authorization").split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (err, id) {
                if (err) {
                    res.status(403).json({ "status": 403, "err": err });
                } else {
                    const categoryId = req.params.categoryId;
                    console.log("categoryId: ", categoryId);
                    var list = await productModel.find({ category: categoryId });
                    res.status(200).json(list);
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
                    res.status(403).json({ "status": 403, "err": err });
                } else {
                    const { name } = req.body;
                    const itemAdd = { name };
                    await categoryModel.create(itemAdd);
                    res.status(200).json({
                        status: true,
                        message: "Add category successful",
                        data: itemAdd
                    });
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
                    res.status(403).json({ "status": 403, "err": err });
                } else {
                    const { id, name } = req.body;
                    var itemUpdate = await categoryModel.findById(id);
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
            res.status(401).json({ "status": 401, message: "Unauthorized" });
        }
    } catch (err) {
        res.status(400).json({ "status": 400, message: "Failed: " + err });
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
                    res.status(403).json({ "status": 403, "err": err });
                } else {
                    const { id } = req.query;
                    const itemDelete = await categoryModel.findByIdAndDelete(id);
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
            res.status(401).json({ "status": 401, message: "Unauthorized" });
        }
    } catch (err) {
        res.status(400).json({ "status": 400, message: "Failed: " + err });
    }
});

module.exports = router;
