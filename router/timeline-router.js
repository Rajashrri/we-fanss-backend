const express = require("express");
const router = express.Router();

const TimelineController = require("../controllers/timeline-controller"); // ✅ Proper naming
const { blogSchema } = require("../validators/auth-validator");
const validate = require("../middlewares/validate-middleware");

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

// ✅ Middlewares
router.use(bodyParser.urlencoded({ extended: true }));
router.use(express.static(path.resolve(__dirname, "../public"))); // corrected static path

// ✅ File upload handling (if needed later)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.resolve("public/timeline");

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// Routes
router.post(
  "/addtimeline",
  upload.fields([
    { name: "media", maxCount: 1 },
  ]),
  TimelineController.addtimeline
);


router.patch(
  "/updatetimeline/:id",
  upload.fields([
    { name: "media", maxCount: 1 },
  ]),
  TimelineController.updatetimeline
);
router.get("/getdata/:celebrityId", TimelineController.getdata);
router.get("/gettimelineByid/:id", TimelineController.gettimelineByid);
router.delete("/deletetimeline/:id", TimelineController.deletetimeline);
router.patch("/updateStatus", TimelineController.updateStatus);



module.exports = router;
