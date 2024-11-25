const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const product = new Schema({
    id: { type: ObjectId }, // khóa chính
    name: { type: String, required: true },
    subcategory: {
        type: String,
        enum: ['Ưa sáng', 'Ưa bóng'],
        required: function () {
            return this.cateId === '6737a0e81d5a6c05d4554b75';
        },
        default: null,
    },
    size: { type: String },
    price: { type: Number },
    stock: { type: Number },
    description: { type: String },
    images: { type: [String] },
    createdAt: {
        type: Date,
        default: () => {
            const date = new Date();
            date.setUTCHours(0, 0, 0, 0); // Đặt giờ là 00:00:00.000+00:00
            return date.toISOString(); // Trả về chuỗi với định dạng mong muốn
        }
    },
    cateId: {
        type: ObjectId,
        ref: 'category'
    }
});
module.exports = mongoose.models.product || mongoose.model('product', product);
