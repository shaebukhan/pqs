const express = require("express");
const { requireSignIn, isAdmin } = require("../middlewares/authMiddleware");
const { createCategoryController, updateCategoryController, categoryController, deleteCategoryController, singleCategoryController, ShowCategoryController } = require("../controllers/categoryController");
const router = express.Router();
//routes 
//create category
// router.post('/create-category', requireSignIn, isAdmin, createCategoryController);
router.post('/new', createCategoryController);
//update category 
// router.put("/:id", requireSignIn, isAdmin, updateCategoryController);
router.put("/:id", updateCategoryController);
//All categories 
// router.get("/get-category", categoryController);
router.get("/categories", categoryController);
router.get("/scategories", ShowCategoryController);
//get single category
router.get("/single-category/:slug", singleCategoryController);
//delete category 
// router.delete("/delete-category/:id", requireSignIn, isAdmin, deleteCategoryController);
router.delete("/:id", deleteCategoryController);













module.exports = router;