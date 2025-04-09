const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const { newWithdrawController, getAllWithdrawsController, getSingleWithdrawController, updateWithdrawController } = require("../controllers/withdrawController");
const router = express.Router();

//new  withdraw
router.post('/new-request', requireSignIn, newWithdrawController);
//get all requests 
router.get('/get-withdraws', requireSignIn, isAdmin, getAllWithdrawsController);
//get single request 
router.get('/get-withdraw/:id', requireSignIn, isAdmin, getSingleWithdrawController);
// update withdraw
router.put('/update/:id', requireSignIn, isAdmin, updateWithdrawController);




module.exports = router;