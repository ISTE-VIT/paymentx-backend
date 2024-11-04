const express = require('express');
const User = require('../models/UserModel');
const Wallet = require('../models/WalletModel');
const authenticateFirebaseUser = require('../middleware/authMiddleware');
const router = express.Router();

// Route to handle user login
router.post('/login', async (req, res) => {
    const { uid, email, displayName } = req.body;
    try {
        let user = await User.findOne({ uid });
        if (!user) {
            // If the user does not exist, create a new user
            user = await User.create({ uid, email, displayName });
            // Create a wallet for the new user
            await Wallet.create({ userId: uid });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// Route to attach phone number
router.post('/attach-phone', authenticateFirebaseUser, async (req, res) => {
    const { phoneNumber } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { uid: req.user.uid },
            { phoneNumber },
            { new: true }
        );
        if (!user) return res.status(404).send('User not found');
        res.status(200).json(user);
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

// Route to attach ID card UID
router.post('/attach-id', authenticateFirebaseUser, async (req, res) => {
    const { idCardUID } = req.body;
    try {
        const user = await User.findOneAndUpdate(
            { uid: req.user.uid },
            { idCardUID },
            { new: true }
        );

        if (!user) return res.status(404).send('User not found');

        // Update the wallet with card UID
        const wallet = await Wallet.findOneAndUpdate(
            { userId: req.user.uid },
            { cardUID: idCardUID },
            { new: true }
        );

        if (!wallet) return res.status(404).send('Wallet not found');
        
        res.status(200).json({ user, wallet });
    } catch (error) {
        res.status(500).send('Server Error');
    }
});

module.exports = router;
