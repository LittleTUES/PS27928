const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const billDetail = new Schema({
    billId: {
        type: ObjectId,
        ref: 'Bill',
        required: true
    },
    product: {
        productId: {
            type: ObjectId,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        subcategory: {
            type: String,
        },
        price: {
            type: Number,
            required: true
        },
        image: {
            type: String,
            required: true
        },
    },
    quantity: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    }
});
module.exports = mongoose.models.billDetail || mongoose.model('billDetail', billDetail);