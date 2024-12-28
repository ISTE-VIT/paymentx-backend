const express = require('express');
const Wallet = require('../models/WalletModel');
const authenticateFirebaseUser = require('../middleware/authMiddleware');
const router = express.Router();
const User = require('../models/UserModel');

// Route to get wallet
router.get('/', authenticateFirebaseUser, async (req, res) => {
    try {
        const wallet = await Wallet.findOne({ userId: req.user.uid });
        if (!wallet) return res.status(404).json({ success: false, message: 'Wallet not found'});
        res.status(200).json({success:true, message:"wallet fetched", wallet: wallet});
    } catch (error) {
        console.error(`Error in ${req.path}:`, error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// Route for Top-up
router.patch('/topup', authenticateFirebaseUser, async (req, res) => {
    const { pin, amount } = req.body;

    // Validate amount and pin
    if (!pin) {
        return res.status(400).json({ success: false, message: 'Pin is required' });
    }
    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
    }

    try {
        // Fetch user and validate pin
        const user = await User.findOne({ uid: req.user.uid });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (pin !== user.pin) {
            return res.status(401).json({ success: false, message: 'Incorrect Pin' });
        }

        // Update wallet balance
        const wallet = await Wallet.findOneAndUpdate(
            { userId: req.user.uid },
            { $inc: { balance: parseInt(amount) } },
            { new: true }
        );
        if (!wallet) {
            return res.status(404).json({ success: false, message: 'Wallet not found' });
        }

        // Respond success
        return res.status(200).json({ success: true, message: 'Topup successful'});
    } catch (error) {
        console.error(`Error in ${req.path}:`, error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Route for Withdrawal
router.patch('/withdraw', authenticateFirebaseUser, async (req, res) => {
    const { pin, amount } = req.body;

    // Validate input
    if (!pin) {
        return res.status(400).json({ success: false, message: 'Pin is required' });
    }
    if (!amount || isNaN(amount) || amount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be a positive number' });
    }

    try {
        // Fetch user and verify pin
        const user = await User.findOne({ uid: req.user.uid });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        if (pin !== user.pin) {
            return res.status(401).json({ success: false, message: 'Incorrect Pin' });
        }

        // Fetch wallet for the user
        const wallet = await Wallet.findOne({ userId: req.user.uid });
        if (!wallet) {
            return res.status(404).json({ success: false, message: 'Wallet not found' });
        }

        // Check balance
        if (wallet.balance < parseInt(amount)) {
            return res.status(400).json({ success: false, message: 'Insufficient balance' });
        }

        // Deduct balance and save
        wallet.balance -= parseInt(amount);
        await wallet.save();

        // Respond success
        return res.status(200).json({ 
            success: true, 
            message: 'Withdrawal successful'
        });
    } catch (error) {
        console.error(`Error in ${req.path}:`, error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});


module.exports = router;