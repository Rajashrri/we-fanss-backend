const express = require("express");
const router = express.Router();
const Positions = require("../controllers/positions-controller");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyparser = require("body-parser");

router.use(bodyparser.urlencoded({ extended: true }));
router.use(express.static(path.resolve(__dirname, 'public')));

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "public/positions";
    if (!fs.existsSync("public")) fs.mkdirSync("public");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Routes

router.get("/languageOptions", Positions.languageOptions);
// In router file
router.post(
  "/addPositions",
  upload.fields([
    { name: "image", maxCount: 1 },
  ]),
  Positions.addPositions
);
router.get("/getPositionsByCelebrity/:celebrityId", Positions.getPositionsByCelebrity);

router.patch("/update-statusPositions", Positions.updateStatus);
router.delete("/deletepositions/:id", Positions.deletepositions);
router.get("/getpositionsByid/:id", Positions.getpositionsByid);
router.patch(
  "/updatepositions/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
  ]),
  Positions.updatePositions
);

module.exports = router;
