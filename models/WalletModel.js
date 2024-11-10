const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    userName: {type: String, required:true},
    balance: { type: Number, default: 0 },
    cardUID: { type: String, default: null },
    isMerchant: {type: Boolean, required: true}  // Card UID field
});

module.exports = mongoose.model('Wallet', walletSchema,'wallets');
