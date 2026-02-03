const multer = require("multer");
const path = require("path");
const fs = require("fs");

const createUploader = ({
  folder = "uploads",
  allowedTypes = [],
  maxSizeMB = 5,
} = {}) => {
  const uploadDir = path.join(__dirname, `../${folder}`);

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_, __, cb) => cb(null, uploadDir),
    filename: (_, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext);
      cb(null, `${base}-${Date.now()}${ext}`);
    },
  });

  const fileFilter = (_, file, cb) => {
    if (
      allowedTypes.length &&
      !allowedTypes.includes(file.mimetype)
    ) {
      return cb(
        new Error("File type not allowed"),
        false
      );
    }
    cb(null, true);
  };

  return multer({
    storage,
    fileFilter,
    limits: { fileSize: maxSizeMB * 1024 * 1024 },
  });
};

module.exports = createUploader;
