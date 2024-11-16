const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const user = new Schema({
    id: { type: ObjectId }, //khóa chính
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    address: { type: String, default: '' },
    // resetPasswordToken: { type: String },
    // resetPasswordExpires: { type: Date },
});
module.exports = mongoose.models.user || mongoose.model('user', user);

