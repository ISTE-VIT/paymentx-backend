const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    merchantId: { type: String, required: true },
    userName:{type: String,required:true},
    merchantName: {type: String, required:true},
    idCardUID:{type: String,required:true},
    amount: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    status: { type: String, enum: ['completed', 'pending', 'failed'], default: 'pending' }
});

module.exports = mongoose.model('Transaction', transactionSchema,'transactions');
