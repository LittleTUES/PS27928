const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const bill = new Schema({
    id: { type: ObjectId }, //khóa chính
    createdAt: { type: Date },
    status: { type: Boolean },
    user: {
        userId: {
            type: String
        },
        name: {
            type: String
        },
        email: {
            type: String
        },
        address: {
            type: String
        },
        phone: {
            type: String
        },
    },
    paymentMethod: {
        type: String,
    },
    deliveryMethod: {
        name: {
            type: String,
            required: true,
        },
        fee: {
            type: Number,
        },
        estimated: {
            type: String,
        }
    },
});
module.exports = mongoose.models.bill || mongoose.model('bill', bill);
