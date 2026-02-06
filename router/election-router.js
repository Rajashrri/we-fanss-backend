const express = require("express");
const router = express.Router();
const Election = require("../controllers/election-controller");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyparser = require("body-parser");
const validate = require("../middlewares/validate.middleware");
router.use(bodyparser.urlencoded({ extended: true }));
router.use(express.static(path.resolve(__dirname, 'public')));

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "public/election";
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

router.get("/languageOptions", Election.languageOptions);

const { z } = require("zod");





router.post(
  "/addElection",
  
  upload.fields([
    { name: "image", maxCount: 1 },
  ]),
  
  Election.addElection
);
router.get("/getElectionByCelebrity/:celebrityId", Election.getElectionByCelebrity);

router.patch("/update-statusElection", Election.updateStatus);
router.delete("/deleteelection/:id", Election.deleteelection);
router.get("/getelectionByid/:id", Election.getelectionByid);
router.patch(
  "/updateelection/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
  ]),
  Election.updateElection
);

module.exports = router;
