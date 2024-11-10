const express = require('express');
const router = express.Router();
const Transaction = require('../models/TransactionModel');
const Wallet = require('../models/WalletModel');
const mongoose = require('mongoose');
const authenticateFirebaseUser = require('../middleware/authMiddleware');

// Route to initiate a transaction via NFC tap (requires idCardUID)
router.post('/initiate', authenticateFirebaseUser, async (req, res) => {
    const { idCardUID, amount } = req.body;
    const merchantId = req.user.uid;

    // Ensure a positive amount
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
    }

    try {
        const session = await mongoose.startSession();
        session.startTransaction();

        // Find user by ID card UID
        const userWallet = await Wallet.findOne({ cardUID: idCardUID }).session(session);
        if (!userWallet) {
            return res.status(404).json({ success: false, message: "User with provided ID card not found" });
        }

        const merchantWallet = await Wallet.findOne({ userId: merchantId }).session(session);
        if (!merchantWallet) {
            return res.status(404).json({ success: false, message: "Merchant not found" });
        }

        if (userWallet.balance < parsedAmount) {
            return res.status(400).json({ success: false, message: "Insufficient Balance" });
        }

        const transaction = await Transaction.create([{
            userId: userWallet.userId,
            merchantId,
            userName: userWallet.userName,
            merchantName: merchantWallet.userName,
            idCardUID,
            amount: parsedAmount,
            status: 'completed'
        }], { session });

        // Update balances
        userWallet.balance -= parsedAmount;
        merchantWallet.balance += parsedAmount;
        await userWallet.save({ session });
        await merchantWallet.save({ session });

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({ success: true, transaction });
    } catch (error) {
        console.error('Error initiating transaction:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});



// Route to fetch transaction history
router.get('/user-history', authenticateFirebaseUser, async (req, res) => {
    const userId = req.user.uid;

    try {
        const transactions = await Transaction.find({ userId:userId }).sort({ timestamp: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Route to fetch merchant transaction history
router.get('/merchant-history', authenticateFirebaseUser, async (req, res) => {
    const merchantId  = req.user.uid;

    try {
        const transactions = await Transaction.find({merchantId:merchantId }).sort({ timestamp: -1 });
        res.status(200).json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Route to get details of a specific transaction
router.get('/:transactionId', authenticateFirebaseUser, async (req, res) => {
    const { transactionId } = req.params;

    try {
        const transaction = await Transaction.findById(transactionId);
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(200).json(transaction);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

// Route to update the status of a transaction (e.g., for failed or reversed transactions)
router.patch('/update-status/:transactionId', authenticateFirebaseUser, async (req, res) => {
    const { transactionId } = req.params;
    const { status } = req.body;

    try {
        const transaction = await Transaction.findByIdAndUpdate(
            transactionId,
            { status },
            { new: true }
        );
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(200).json({ success: true, transaction });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
