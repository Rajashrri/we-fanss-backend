const express = require("express");
const router = express.Router();
const profilecontrollers = require("../controllers/profile-controller");
const authenticate = require("../middlewares/auth-middleware");

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyparser = require("body-parser");

router.use(bodyparser.urlencoded({ extended: true }));
router.use(express.static(path.resolve(__dirname, "public")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync("public")) {
      fs.mkdirSync("public");
    }
    if (!fs.existsSync("public/profile")) {
      fs.mkdirSync("public/profile");
    }
    cb(null, "public/profile");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "_" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept only image files
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// All routes require authentication
router.use(authenticate);

// Get current user profile - GET /api/profile
router.get("/", profilecontrollers.getProfile);

// Update current user profile - PUT /api/profile
router.put("/", upload.single("pic"), profilecontrollers.updateProfile);

// Update current user password - PUT /api/profile/password
router.put("/password", profilecontrollers.updatePassword);

module.exports = router;