const express = require("express");
const router = express.Router();
const Moviev = require("../controllers/moviev-controller");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyparser = require("body-parser");

router.use(bodyparser.urlencoded({ extended: true }));
router.use(express.static(path.resolve(__dirname, 'public')));

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "public/moviev";
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

router.get("/languageOptions", Moviev.languageOptions);
// In router file
router.post(
  "/addmoviev",
  upload.fields([
    { name: "image", maxCount: 1 },
  ]),
  Moviev.addMoviev
);
router.get("/getMoviesByCelebrity/:celebrityId", Moviev.getMoviesByCelebrity);
router.get("/GenreMasterOptions", Moviev.GenreMasterOptions);

router.patch("/update-statusmoviev", Moviev.updateStatus);
router.delete("/deletemoviev/:id", Moviev.deletemoviev);
router.get("/getmovievByid/:id", Moviev.getmovievByid);
router.patch(
  "/updatemoviev/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
  ]),
  Moviev.updatemoviev
);

module.exports = router;
