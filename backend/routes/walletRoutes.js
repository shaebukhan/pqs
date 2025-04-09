const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const { addWalletController, getAllWalletsController, getSingleWalletController, changeCurrencyController, getCurrencyController, getWalletTransactions } = require("../controllers/walletController");
const { getWalletDetailsTransactionController } = require("../controllers/withdrawController");
const router = express.Router();

//new  wallet
router.post('/add-wallet', requireSignIn, isAdmin, addWalletController);
router.post('/base-currency', requireSignIn, isAdmin, changeCurrencyController);
router.get('/get-currency/:id', requireSignIn, getCurrencyController);
//get  wallet 
router.get("/get-wallets/:userId", requireSignIn, getAllWalletsController);
router.get("/get-wallet-data", requireSignIn, getSingleWalletController);
router.get('/transactions-wallet', getWalletTransactions);

module.exports = router; 