const express = require("express");
const router = express.Router();
const Series = require("../controllers/series-controller");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyparser = require("body-parser");

router.use(bodyparser.urlencoded({ extended: true }));
router.use(express.static(path.resolve(__dirname, "public")));

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "public/series";
    if (!fs.existsSync("public")) fs.mkdirSync("public");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Routes

router.get("/languageOptions", Series.languageOptions);

// In router file
router.post(
  "/addseries",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "imagebg", maxCount: 1 },
  ]),
  Series.addSeries,
);
router.get("/getSeriesByCelebrity/:celebrityId", Series.getSeriesByCelebrity);
router.get("/GenreMasterOptions", Series.GenreMasterOptions);

router.patch("/update-statusseries", Series.updateStatus);


router.patch(
  "/featured/:id",
  
  Series.updateSeriesFeatured
);


router.delete("/deleteseries/:id", Series.deleteseries);
router.get("/getseriesByid/:id", Series.getseriesByid);
router.patch(
  "/updateseries/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "imagebg", maxCount: 1 },
  ]),
  Series.updateSeries,
);

module.exports = router;
