// utils/upload.js

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const PROJECT_ROOT = path.resolve(__dirname, "..");

const createStorage = (folderName) => {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      const dir = path.join(PROJECT_ROOT, "public", folderName);
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
    limits: { fileSize: options.maxSize || 5 * 1024 * 1024 },
    fileFilter:
      options.fileFilter ||
      function (req, file, cb) {
        const allowed = /jpeg|jpg|png|gif|webp/;
        const valid =
          allowed.test(path.extname(file.originalname).toLowerCase()) &&
          allowed.test(file.mimetype);
        cb(valid ? null : new Error("Only images allowed!"), valid);
      },
  });
};

const professionUpload = createUpload("professions");
const celebrityUpload = createUpload("celebrity");
const referencesUpload = createUpload("references", {
  maxSize: 50 * 1024 * 1024,
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|mp4|avi|mov|wmv|mkv/;
    const isMedia =
      file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/");
    cb(isMedia ? null : new Error("Only images/videos allowed!"), isMedia);
  },
});

const moveFile = (file, targetFolder, newName) => {
  const dir = path.join(PROJECT_ROOT, "public", targetFolder);

  // folder create
  fs.mkdirSync(dir, { recursive: true });

  const newPath = path.join(dir, newName);

  // safer move
  fs.copyFileSync(file.path, newPath);
  fs.unlinkSync(file.path);

  return `/${targetFolder}/${newName}`;
};

const processCelebrityFiles = (files, celebId) => {
  const result = { imagePath: null, categoryImagePath: null, galleryPaths: [] };

  if (!files) return result;

  // Profile image
  if (files.image?.[0]) {
    const file = files.image[0];
    const ext = path.extname(file.originalname);
    result.imagePath = moveFile(file, "celebrity/profile", `${celebId}${ext}`);
  }

  // ==========================
  // CATEGORY IMAGE
  // /celebrity/categoryimage/ID.webp
  // ==========================
  if (files.categoryimage?.[0]) {
    const file = files.categoryimage[0];
    const ext = path.extname(file.originalname);

    result.categoryImagePath = moveFile(
      file,
      "celebrity/categoryimage",
      `${celebId}${ext}`,
    );
  }

  // Gallery images
  if (files.gallery?.length) {
    files.gallery.forEach((file, i) => {
      const ext = path.extname(file.originalname);
      const galleryPath = moveFile(
        file,
        "celebrity/gallery",
        `${celebId}-${i}${ext}`,
      );
      result.galleryPaths.push(galleryPath);
    });
  }

  return result;
};

const processReferenceFiles = (files, referenceId) => {
  const mediaArray = [];

  if (!files?.length) return { mediaArray };

  files.forEach((file, i) => {
    const ext = path.extname(file.originalname);
    const isImage = file.mimetype.startsWith("image/");
    const type = isImage ? "image" : "video";

    const fileName = `${referenceId}-${Date.now()}-${i}${ext}`;
    const mediaPath = moveFile(file, `references/${type}`, fileName);

    mediaArray.push({
      mediaPath,
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      uploadedAt: new Date(),
    });
  });

  return { mediaArray };
};

module.exports = {
  createUpload,
  professionUpload,
  celebrityUpload,
  referencesUpload,
  processCelebrityFiles,
  processReferenceFiles,
};
