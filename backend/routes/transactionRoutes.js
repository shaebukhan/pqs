const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const { createTransactionController, getAllTransactionsController, getAllUserTransactionsController, getAllTransactionWithWalletController } = require("../controllers/transactionController");
const { getTransactionWalletsController } = require("../controllers/withdrawController");
const router = express.Router();
//routes
//create 
router.post('/new', requireSignIn, isAdmin, createTransactionController);
//All  Transactions
router.get("/transactions", requireSignIn, isAdmin, getAllTransactionsController);
router.get("/user-transactions-wallet/:id", requireSignIn, getAllTransactionWithWalletController);
//transaction wallets
router.get("/transaction-wallet/:id", requireSignIn, getTransactionWalletsController);
router.get("/user-transactions/:id", requireSignIn, getAllUserTransactionsController);

module.exports = router;