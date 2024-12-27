const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/mongoConfig');
const userRoutes = require('./routes/user');
const walletRoutes = require('./routes/wallet');
const transactionRoutes = require('./routes/transaction');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
connectDB();
app.use(express.urlencoded({extended:false}));


app.get('/',async (req,res)=>{
    res.status(200).json({sucess:true, message : "Working"});
})

app.use('/api/users', userRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/transactions',transactionRoutes);

module.exports = app;