const express = require("express");
const router = express.Router();
const Triviaentries = require("../controllers/triviaentries-controller");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

// ✅ Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join("public", "triviaentries");
    if (!fs.existsSync("public")) fs.mkdirSync("public");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// ✅ Routes

// Add Trivia Entry
router.post(
  "/addtriviaentries",
  upload.fields([{ name: "media", maxCount: 1 }]),
  Triviaentries.addtriviaentries
);

// Get all Trivia Entries
router.get("/getdatatriviaentries/:celebrityId", Triviaentries.getdatatriviaentries);

// Get Trivia Entry by ID
router.get("/gettriviaentriesByid/:id", Triviaentries.gettriviaentriesByid);

// Update Trivia Entry
router.patch(
  "/updatetriviaentries/:id",
  upload.fields([{ name: "media", maxCount: 1 }]),
  Triviaentries.updatetriviaentries
);

// Update status
router.patch("/update-statustriviaentries", Triviaentries.updateStatustriviaentries);

// Delete Trivia Entry
router.delete("/deletetriviaentries/:id", Triviaentries.deletetriviaentries);

// Get category dropdown
router.get("/categoryOptions", Triviaentries.categoryOptions);

module.exports = router;
