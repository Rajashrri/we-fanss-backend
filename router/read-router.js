// routes/read-router.js

const express = require("express");
const router = express.Router();

const ReadController = require("../controllers/read-controller");

const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyParser = require("body-parser");

const authenticate = require("../middlewares/auth-middleware");

/* ================= MIDDLEWARES ================= */

router.use(bodyParser.urlencoded({ extended: true }));

router.use(
  express.static(path.resolve(__dirname, "../public"))
);

/* ================= MULTER STORAGE ================= */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = path.resolve("public/read");

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

/* ================= AUTH ================= */

router.use(authenticate);

/* ================= ROUTES ================= */

/* ADD READ */
router.post(
  "/addread",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
  ]),
  ReadController.addRead
);

/* UPDATE READ */
router.patch(
  "/updateread/:id",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
  ]),
  ReadController.updateRead
);

/* GET ALL READ DATA */
router.get(
  "/getdata/:celebrityId",
  ReadController.getdata
);

/* GET READ BY ID */
router.get(
  "/getreadByid/:id",
  ReadController.getreadByid
);

/* DELETE READ */
router.delete(
  "/deleteread/:id",
  ReadController.deleteRead
);

/* UPDATE STATUS */
router.patch(
  "/updateStatus",
  ReadController.updateStatus
);

module.exports = router;