const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/mongoConfig');
const userRoutes = require('./routes/user');
const walletRoutes = require('./routes/wallet');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
connectDB();
app.use(express.urlencoded({extended:false}));
app.use('/api/users', userRoutes);
app.use('/api/wallets', walletRoutes);

module.exports = app;