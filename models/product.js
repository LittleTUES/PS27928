const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const product = new Schema({
    id: { type: ObjectId }, //khóa chính
    name: { type: String },
    image: { type: String },
    description: { type: String },
    cateId: {
        type: ObjectId,
        ref: 'category'
    } //khóa ngoại
});
module.exports = mongoose.models.product || mongoose.model('product', product);
