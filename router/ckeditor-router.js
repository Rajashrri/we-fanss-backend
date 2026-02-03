const express = require("express");
const router = express.Router();
const createUploader = require("../middlewares/upload-middleware");

const upload = createUploader({
  folder: "uploads/ckeditor",
  allowedTypes: ["image/png", "image/jpeg", "image/webp"],
  maxSizeMB: 5,
});

router.post(
  "/upload",
  upload.single("upload"), // CKEditor field
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        uploaded: false,
        error: { message: "No file uploaded" },
      });
    }

    res.json({
      uploaded: true,
      url: `${process.env.BACKEND_URL}/uploads/ckeditor/${req.file.filename}`,
    });
  }
);

module.exports = router;
