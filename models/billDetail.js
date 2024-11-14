const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const billDetail = new Schema({
    billId: {
        type: ObjectId,
        ref: 'bill'
    },
    productId: {
        type: ObjectId,
        ref: 'product'
    },
    quantity: {
        type: Number,
    }

});
module.exports = mongoose.models.billDetail || mongoose.model('billDetail', billDetail);
