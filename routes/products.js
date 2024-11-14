var express = require("express");
var router = express.Router();

var productModel = require("../models/product");
var categoryModel = require("../models/category");

const JWT = require('jsonwebtoken');
const config = require("../utils/config-env");

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Lấy danh sách sản phẩm
 *     tags: 
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Thành công trả về danh sách sản phẩm
 *       '400':
 *         description: Thất bại
 *       '401':
 *         description: Không được phép
 *       '403':
 *         description: JWT đã hết hạn
 */
router.get('/', async function (req, res) {
    try {
        // const token = req.header("Authorization").split(' ')[1];
        const authorizationHeader = req.header("Authorization");
        const token = authorizationHeader.split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (err, id) {
                if (err) {
                    res.status(403).json({ "status": 403, "err": err });
                } else {
                    //xử lý chức năng tương ứng với API
                    var list = await productModel.find();
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
 * /products/detail/{productId}:
 *   get:
 *     summary: Lấy chi tiết sản phẩm
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *           example: 6706d1c95944ac65d27646c3
 *         description: ID của product
 *     responses:
 *       '200':
 *         description: Thành công trả về sản phẩm
 *       '400':
 *         description: Thất bại
 *       '401':
 *         description: Không được phép
 *       '403':
 *         description: JWT đã hết hạn
 */
router.get('/detail/:productId', async function (req, res) {
    try {
        const authorizationHeader = req.header("Authorization");
        const token = authorizationHeader.split(' ')[1];
        if (token) {
            JWT.verify(token, config.SECRETKEY, async function (err, id) {
                if (err) {
                    res.status(403).json({ "status": 403, "err": err });
                } else {
                    const { productId } = req.params; // Sửa lại từ id thành productId
                    var item = await productModel.findById(productId);
                    res.status(200).json(item);
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
 * /products/add:
 *   post:
 *     summary: Thêm sản phẩm mới
 *     tags: 
 *       - Products
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
 *                 example: example
 *               image:
 *                 type: string
 *                 example: https://example.com/
 *               description:
 *                 type: string
 *                 example: example
 *               category:
 *                 type: string
 *                 example: 6706cd925944ac65d27646a2
 *     responses:
 *       '200':
 *         description: Thêm sản phẩm thành công
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
                    const { name, image, description, category } = req.body;
                    const obj = await categoryModel.findById(category);
                    if (obj) {
                        const itemAdd = { name, image, description, category };
                        await productModel.create(itemAdd);
                        res.status(200).json({
                            status: true,
                            message: "Add product successful",
                            data: itemAdd
                        });
                    } else {
                        return res.status(400).json({ status: false, message: "Category does not exist" });
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
 * /products/edit:
 *   put:
 *     summary: Thay đổi thông tin sản phẩm
 *     tags: 
 *       - Products
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
                    var itemUpdate = await productModel.findById(id);
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
 *       - Products
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
                    const product = await productModel.findByIdAndDelete(id);
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