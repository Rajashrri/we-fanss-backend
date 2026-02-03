const express = require("express");
const router = express.Router();

const CustomOptionController = require("../controllers/customoption-controller"); // ✅ Proper naming
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
    const dir = path.resolve("public/customoption");

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
  "/addcustomoption",
  upload.fields([
    { name: "media", maxCount: 1 },
  ]),
  CustomOptionController.addcustomoption
);


router.patch(
  "/updatecustomoption/:id",
  upload.fields([
    { name: "media", maxCount: 1 },
  ]),
  CustomOptionController.updatecustomoption
);

router.get("/getdata/:celebrityId", CustomOptionController.getdata);
router.get("/getcustomoptionByid/:id", CustomOptionController.getcustomoptionByid);
router.delete("/deletecustomoption/:id", CustomOptionController.deletecustomoption);
router.patch("/updateStatus", CustomOptionController.updateStatus);

module.exports = router;
