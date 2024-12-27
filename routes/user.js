const express = require('express');
const User = require('../models/UserModel');
const Wallet = require('../models/WalletModel');
const authenticateFirebaseUser = require('../middleware/authMiddleware');
const router = express.Router();

/**
 * 🟢 Route to handle user login
 * URL: /api/user/login
 * Method: POST
 * Body: { email, displayName, isMerchant }
 * Headers: { Authorization: Bearer <Firebase ID Token> }
 */
router.post('/login', authenticateFirebaseUser, async (req, res) => {
    const { uid } = req.user;
    const { email, displayName, isMerchant } = req.body;

    try {
        let user = await User.findOne({ uid });
        
        if (user) {
            if (user.isMerchant !== isMerchant) {
                return res.status(403).json({
                    success: false, 
                    message: `Account already exists as a ${user.isMerchant ? 'Merchant' : 'User'}. Please use the correct app to log in.`
                });
            }
        } else {
            user = await User.create({ uid, email, displayName, isMerchant });
            await Wallet.create({ userId: uid, userName: displayName, isMerchant });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Error in /login:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

/**
 * 🟢 Route to attach phone number
 * URL: /api/user/attach-phone
 * Method: PATCH
 * Body: { phoneNumber }
 * Headers: { Authorization: Bearer <Firebase ID Token> }
 */
router.patch('/attach-phone', authenticateFirebaseUser, async (req, res) => {
    const { phoneNumber } = req.body;

    try {
        const existingUser = await User.findOne({ phoneNumber });
        if (existingUser) {
            return res.status(409).json({ success: false, message: 'Phone number is already in use' });
        }

        const user = await User.findOneAndUpdate(
            { uid: req.user.uid },
            { phoneNumber },
            { new: true }
        );

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        res.status(200).json({ 
            success: true, 
            message: 'Phone number attached successfully'
        });
    } catch (error) {
        console.error('Error in /attach-phone:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

/**
 * 🟢 Route to attach ID card UID
 * URL: /api/user/attach-id
 * Method: PATCH
 * Body: { idCardUID }
 * Headers: { Authorization: Bearer <Firebase ID Token> }
 */
router.patch('/attach-id', authenticateFirebaseUser, async (req, res) => {
    const { idCardUID } = req.body;

    try {
        const existingUser = await User.findOne({ idCardUID });
        if (existingUser) {
            return res.status(409).json({success: false, message: 'ID Card is already in use' });
        }

        const user = await User.findOneAndUpdate(
            { uid: req.user.uid },
            { idCardUID },
            { new: true }
        );

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const wallet = await Wallet.findOneAndUpdate(
            { userId: req.user.uid },
            { cardUID: idCardUID },
            { new: true }
        );

        if (!wallet) return res.status(404).json({success: false, message: 'Wallet not found' });

        res.status(200).json({ 
            success: true, 
            message: 'ID Card attached successfully',
        });
    } catch (error) {
        console.error('Error in /attach-id:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});


router.patch('/create-pin',authenticateFirebaseUser,async (req,res)=>{
    const { pin } = req.body;
    
    try{
      const user = await User.findOneAndUpdate(
        { uid: req.user.uid },
        { pin: pin },
        { new: true }
      );

      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      res.status(200).json({ 
            success: true, 
            message: 'Pin created successfully'
      });
    }catch (error) {
        console.error('Error in /create-pin:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

router.get('/check-user', authenticateFirebaseUser, async (req, res) => {
    const { uid } = req.user;
    try {
        let user = await User.findOne({ uid });
        if (user) {
            return res.status(200).json({
                success: true,
                message: 'User found',
                user,
            });
        } else {
            res.status(404).json({
                success: false, 
                message: 'User Not Found'
            })
        }
    } catch (error) {
        console.error('Error in /check-user:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server Error' 
        });
    }
});



module.exports = router;
