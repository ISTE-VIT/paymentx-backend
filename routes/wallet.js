const express = require('express');
const Wallet = require('../models/WalletModel');
const authenticateFirebaseUser = require('../middleware/authMiddleware');
const router = express.Router();

// Route to get wallet balance
router.get('/', authenticateFirebaseUser, async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ userId: req.user.uid });
        if (!wallet) return res.status(404).json({ message: 'Wallet not found' });
        res.status(200).json(wallet);
    } catch (error) {
        console.error(`Error in ${req.path}:`, error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Route for Top-up
router.patch('/topup', authenticateFirebaseUser, async (req, res) => {
    const amount = parseFloat(req.body.amount);
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number' });
    }
    try {
        const wallet = await Wallet.findOneAndUpdate(
            { userId: req.user.uid },
            { $inc: { balance: amount } },
            { new: true }
        );

        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        res.status(200).json(wallet);
    } catch (error) {
        console.error(`Error in ${req.path}:`, error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Route for Withdrawal
router.patch('/withdraw', authenticateFirebaseUser, async (req, res) => {
    const amount = parseFloat(req.body.amount);
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ message: 'Amount must be a positive number' });
    }
    try {
        const wallet = await Wallet.findOne({ userId: req.user.uid });
        
        if (!wallet) {
            return res.status(404).json({ message: 'Wallet not found' });
        }

        if (wallet.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        wallet.balance -= amount;
        await wallet.save();
        res.status(200).json(wallet);
    } catch (error) {
        console.error(`Error in ${req.path}:`, error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;