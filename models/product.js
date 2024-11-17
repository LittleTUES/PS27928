const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const product = new Schema({
    id: { type: ObjectId }, // khóa chính
    name: { type: String, required: true },
    description: { type: String },
    image: { type: [String] },
    subcategory: {
        type: String,
        enum: ['Ưa sáng', 'Ưa bóng'],
        required: function () {
            return this.cateId === '6737a0e81d5a6c05d4554b75';
        },
        default: null,
    },
    createdAt: { type: Date, default: () => new Date().toISOString().split('T')[0] },
    cateId: {
        type: ObjectId,
        ref: 'category'
    }
});
module.exports = mongoose.models.product || mongoose.model('product', product);
