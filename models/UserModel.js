const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    displayName: { type: String, required: true },
    isMerchant: {type: Boolean,required:true},
    phoneNumber: { type: String, default: null },
    idCardUID: { type: String, default: null }
});

module.exports = mongoose.model('User', userSchema,'users');
