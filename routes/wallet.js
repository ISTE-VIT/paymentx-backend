const express = require('express');
const Wallet = require('../models/WalletModel');
const authenticateFirebaseUser = require('../middleware/authMiddleware');
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

// Additional wallet routes can be added here

module.exports = router;
