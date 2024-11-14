const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const bill = new Schema({
    id: { type: ObjectId }, //khóa chính
    createdAt: { type: Date },
    status: { type: Boolean },
    paymentId: {
        type: ObjectId,
        ref: 'payment'
    },
    deliveryId: {
        type: ObjectId,
        ref: 'delivery'
    }
});
module.exports = mongoose.models.bill || mongoose.model('bill', bill);
