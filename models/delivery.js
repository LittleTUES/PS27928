const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const delivery = new Schema({
    id: { type: ObjectId }, // khóa chính
    name: {
        type: String, // kiểu dữ liệu
        required: true,
    },
    fee: {
        type: Number,
    },
    deliveryRange: {
        type: [Number],
    }

});
module.exports = mongoose.models.delivery || mongoose.model('delivery', delivery);