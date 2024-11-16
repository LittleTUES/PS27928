const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const cart = new Schema({
    userId: {
        type: ObjectId,
        ref: 'user'
    },
    productId: {
        type: ObjectId,
        ref: 'product'
    },
    quantity: {
        type: Number,
    }

});
module.exports = mongoose.models.cart || mongoose.model('cart', cart);
