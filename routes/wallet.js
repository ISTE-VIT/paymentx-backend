const express = require('express');
const Wallet = require('../models/WalletModel');
const authenticateFirebaseUser = require('../middleware/authMiddleware');
const { route } = require('./user');
const { findOneAndUpdate } = require('../models/UserModel');
const router = express.Router();

// Route to get wallet balance
router.get('/', authenticateFirebaseUser, async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ userId: req.user.uid });
        if (!wallet) return res.status(404).send('Wallet not found');
        res.status(200).json(wallet);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});


//Route for Topup
router.patch('/topup', authenticateFirebaseUser, async (req, res) => {
    const amount  = req.body.amount;
    try {
        const wallet = await Wallet.findOneAndUpdate(
            { userId: req.user.uid },
            { $inc: { balance: amount } },
            { new: true }
        );

        if (!wallet) {
            return res.status(404).send('Wallet not found');
        }

        res.status(200).json(wallet);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

//Route for withdrawal
router.patch('/withdraw', authenticateFirebaseUser, async (req, res) => {
    const amount = req.body.amount;
    try {
        // Check wallet balance
        const wallet = await Wallet.findOne({ userId: req.user.uid });
        
        if (!wallet) {
            return res.status(404).send('Wallet not found');
        }

        // Check for sufficient balance
        if (wallet.balance < amount) {
            return res.status(400).send('Insufficient balance');
        }

        // Proceed with the withdrawal
        wallet.balance -= amount;
        await wallet.save();
        res.status(200).json(wallet);
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
