const express = require("express");
const router = express.Router();

const CustomOptionController = require("../controllers/customoption-controller");
const validate = require("../middlewares/validate.middleware");
const authenticate = require("../middlewares/auth-middleware");

const {
  createCustomOptionSchema,
  updateCustomOptionSchema,
  updateStatusSchema,
  getDataSchema,
  deleteCustomOptionSchema,
  getCustomOptionByIdSchema,
} = require("../validations/custom.validation");

const multer = require("multer");
const fs = require("fs");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.resolve("public/custom-section");

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

router.use(authenticate);

router.post(
  "/",
  upload.fields([{ name: "media", maxCount: 1 }]),
  validate(createCustomOptionSchema),
  CustomOptionController.addcustomoption
);

router.put(
  "/:id",
  upload.fields([{ name: "media", maxCount: 1 }]),
  validate(updateCustomOptionSchema),
  CustomOptionController.updatecustomoption
);

router.patch(
  "/:id/status",
  validate(updateStatusSchema),
  CustomOptionController.updateStatus
);

router.get(
  "/celebrity/:celebrity",
  validate(getDataSchema),
  CustomOptionController.getdata
);

router.get(
  "/:id",
  validate(getCustomOptionByIdSchema),
  CustomOptionController.getcustomoptionByid
);

router.delete(
  "/:id",
  validate(deleteCustomOptionSchema),
  CustomOptionController.deletecustomoption
);

module.exports = router;