// ===============================
// utils/upload.js
// LOCAL + CLOUDINARY SUPPORT
// ===============================
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cloudinary = require("./cloudinary");

const PROJECT_ROOT = path.resolve(__dirname, "..");

const createStorage = (folderName) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(PROJECT_ROOT, "temp", folderName);

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      cb(null, dir);
    },

    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
};

const createUpload = (folderName, options = {}) => {
  return multer({
    storage: createStorage(folderName),

    limits: {
      fileSize: options.maxSize || 5 * 1024 * 1024,
    },

    fileFilter:
      options.fileFilter ||
      function (req, file, cb) {
        const allowed = /jpeg|jpg|png|gif|webp/;

        const valid =
          allowed.test(path.extname(file.originalname).toLowerCase()) &&
          allowed.test(file.mimetype);

        cb(valid ? null : new Error("Only images allowed"), valid);
      },
  });
};
const professionUpload = createUpload("professions");
const celebrityUpload = createUpload("celebrity");
// ===============================
// CLOUDINARY UPLOAD FUNCTION
// ===============================
const uploadToCloudinary = async (filePath, folder) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
  });

  fs.unlinkSync(filePath); // temp file delete

  return result.secure_url;
};

// ===============================
// CELEBRITY FILE PROCESSOR
// ===============================
const processCelebrityFiles = async (files, celebId) => {
  const result = {
    imagePath: null,
    categoryImagePath: null,
    featuredImagePath: null,
    galleryPaths: [],
  };

  if (!files) return result;

  // profile image
  if (files.image?.[0]) {
    result.imagePath = await uploadToCloudinary(
      files.image[0].path,
      "celebrity/profile"
    );
  }

  // category image
  if (files.categoryimage?.[0]) {
    result.categoryImagePath = await uploadToCloudinary(
      files.categoryimage[0].path,
      "celebrity/category"
    );
  }

  // featured image
  if (files.featuredimage?.[0]) {
    result.featuredImagePath = await uploadToCloudinary(
      files.featuredimage[0].path,
      "celebrity/featured"
    );
  }

  // gallery
  if (files.gallery?.length) {
    for (const file of files.gallery) {
      const url = await uploadToCloudinary(
        file.path,
        "celebrity/gallery"
      );

      result.galleryPaths.push(url);
    }
  }

  return result;
};

module.exports = {
  createUpload,
  processCelebrityFiles,
  professionUpload,
    celebrityUpload,

};