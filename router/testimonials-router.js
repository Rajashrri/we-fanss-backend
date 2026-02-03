const express = require("express");
const router = express.Router();

const TestimonialsController = require("../controllers/testimonial-controller"); // ✅ Proper naming
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
    const dir = path.resolve("public/testimonial");

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
  "/addtestimonial",
  upload.fields([
    { name: "image", maxCount: 1 },
  ]),
  TestimonialsController.addtestimonial
);


router.patch(
  "/updatetestimonial/:id",
  upload.fields([
    { name: "image", maxCount: 1 },
  ]),
  TestimonialsController.updatetestimonial
);
router.get("/getdatatestimonial", TestimonialsController.getdata);
router.get("/gettestimonialsByid/:id", TestimonialsController.gettestimonialsByid);
router.delete("/deletetestimonial/:id", TestimonialsController.deletetestimonial);
router.patch("/update-statustestimonial", TestimonialsController.updateStatus);



module.exports = router;
