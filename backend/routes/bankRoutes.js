const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const { addBankController, getAllBanksController, getSingleBankController } = require("../controllers/bankController");
const router = express.Router();

//new bank
router.post('/add-bank', requireSignIn, isAdmin, addBankController);
//get banks 
router.get("/get-banks/:userId", requireSignIn, getAllBanksController);
router.get("/get-bank-data/:id", requireSignIn, getSingleBankController);

module.exports = router;