// routes/watch-router.js

const express = require("express");
const router = express.Router();

const WatchController = require("../controllers/watch-controller");

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
    const dir = path.resolve("public/watch");

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

/* ADD WATCH */
router.post(
  "/addwatch",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
  ]),
  WatchController.addWatch
);

/* UPDATE WATCH */
router.patch(
  "/updatewatch/:id",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
  ]),
  WatchController.updateWatch
);

/* GET ALL WATCH DATA */
router.get(
  "/getdata/:celebrityId",
  WatchController.getdata
);

/* GET WATCH BY ID */
router.get(
  "/getwatchByid/:id",
  WatchController.getwatchByid
);

/* DELETE WATCH */
router.delete(
  "/deletewatch/:id",
  WatchController.deleteWatch
);

/* UPDATE STATUS */
router.patch(
  "/updateStatus",
  WatchController.updateStatus
);

module.exports = router;