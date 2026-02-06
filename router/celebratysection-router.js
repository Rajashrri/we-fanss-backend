// routes/celebratysection-routes.js
const express = require("express");
const router = express.Router();
const { getCelebritySections } = require("../controllers/celebratysection-controller");

router.get("/:celebratyId", getCelebritySections);

module.exports = router;