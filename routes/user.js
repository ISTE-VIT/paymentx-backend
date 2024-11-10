// routes/userRoutes.js
const express = require('express');
const User = require('../models/UserModel');
const Wallet = require('../models/WalletModel');
const authenticateFirebaseUser = require('../middleware/authMiddleware');
const router = express.Router();

// Route to handle user login
router.post('/login', authenticateFirebaseUser, async (req, res) => {
    const { uid } = req.user;
    const { email, displayName, isMerchant } = req.body;
    try {
        let user = await User.findOne({ uid });
        if (user) {
            // Check if the existing user's type (isMerchant) matches the app's intended type
            if (user.isMerchant !== isMerchant) {
                return res.status(403).json({
                    message: `Account already exists as ${user.isMerchant ? 'Merchant' : 'User'}. Please use the correct app to log in.`
                });
            }
        } else {
            // If the user does not exist, create a new user and wallet
            user = await User.create({ uid, email, displayName, isMerchant });
            await Wallet.create({ userId: uid, userName: displayName,isMerchant });
        }
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error in /login:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Route to attach phone number
router.patch('/attach-phone', authenticateFirebaseUser, async (req, res) => {
    const { phoneNumber } = req.body;
    try {
        const existingUser = await User.findOne({ phoneNumber });
        if (existingUser) {
            return res.status(409).json({ message: 'Phone number is already in use' });
        }

        const user = await User.findOneAndUpdate(
            { uid: req.user.uid },
            { phoneNumber },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: 'User not found' });
        res.status(200).json({ success: true, user });
    } catch (error) {
        console.error('Error in /attach-phone:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// Route to attach ID card UID
router.patch('/attach-id', authenticateFirebaseUser, async (req, res) => {
    const { idCardUID } = req.body;
    try {
        const existingUser = await User.findOne({ idCardUID });
        if (existingUser) {
            return res.status(409).json({ message: 'ID Card is already in use' });
        }

        const user = await User.findOneAndUpdate(
            { uid: req.user.uid },
            { idCardUID },
            { new: true }
        );

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update the wallet with card UID
        const wallet = await Wallet.findOneAndUpdate(
            { userId: req.user.uid },
            { cardUID: idCardUID },
            { new: true }
        );

        if (!wallet) return res.status(404).json({ message: 'Wallet not found' });

        res.status(200).json({ success: true, user, wallet });
    } catch (error) {
        console.error('Error in /attach-id:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
