const express = require("express");

const router = express.Router();

const {
  createCollection,
  getUserCollections,
  saveToCollection,
} = require("../controllers/collection-controller");

router.post(
  "/create",
  createCollection
);

router.get(
  "/:userId",
  getUserCollections
);

router.post(
  "/save",
  saveToCollection
);

module.exports = router;