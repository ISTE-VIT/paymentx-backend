const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    balance: { type: Number, default: 0 },
    cardUID: { type: String, default: null }  // Card UID field
});

module.exports = mongoose.model('Wallet', walletSchema,'wallets');
