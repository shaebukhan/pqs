const express = require("express");
const router = express.Router();
const upload = require("../utilis/upload");
const {
  newKycController,
  getAllKycController,
  updateKycController,
  getSingleKycController,
  getSingleKycUserController,
  updateUserKycController,
} = require("../controllers/kycController");
const {
  requireSignIn,
  isAdmin,
  checkPermission,
} = require("../middlewares/authMiddleware");

const fileUploadFields = [
  { name: "nationalId", maxCount: 1 },
  { name: "proofOfResidence", maxCount: 1 },
  { name: "signature", maxCount: 1 },
  { name: "listDirectors", maxCount: 1 },
  { name: "listShareHolders", maxCount: 1 },
  { name: "listBeneficialOwners", maxCount: 1 },
  { name: "listOwnersHoldings", maxCount: 1 },
  { name: "certificate", maxCount: 1 },
  { name: "memorandum", maxCount: 1 },
  { name: "financialAccounts", maxCount: 1 },
];

router.post(
  "/new-kyc",
  upload.fields(fileUploadFields),
  requireSignIn,
  newKycController
);
router.post("/update-kyc", requireSignIn, updateUserKycController);
router.get(
  "/kycs",
  requireSignIn,
  isAdmin,
  checkPermission("kyc", "view,approve,reject"),
  getAllKycController
);
router.get("/single-kyc/:id", requireSignIn, getSingleKycController);
router.get("/user-kyc/:userID", requireSignIn, getSingleKycUserController);
router.put(
  "/:id",
  requireSignIn,
  isAdmin,
  checkPermission("kyc", "view,approve,reject"),
  updateKycController
);

module.exports = router;
