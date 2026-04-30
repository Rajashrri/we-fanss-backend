const express = require("express");
const router = express.Router();

const {
  getCelebritiesByCategory,getCelebrityBySlug,
} = require("../controllers/frontcategory-controller");

router.get("/frontcategory/:slug", getCelebritiesByCategory);
router.get("/celebrity/:slug", getCelebrityBySlug);

module.exports = router;

