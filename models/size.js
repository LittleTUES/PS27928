const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const size = new Schema({
    id: { type: ObjectId }, //khóa chính
    size: { type: String, default: null },
    price: { type: Number },
    stock: { type: Number },
});
module.exports = mongoose.models.size || mongoose.model('size', size);