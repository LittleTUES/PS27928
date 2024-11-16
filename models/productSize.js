const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const productSize = new Schema({
    productId: { type: ObjectId },
    sizeId: { type: ObjectId }, //khóa chính
});
module.exports = mongoose.models.productSize || mongoose.model('productSize', productSize);
