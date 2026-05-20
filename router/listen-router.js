// routes/listen-router.js

const express = require("express");
const router = express.Router();

const ListenController = require("../controllers/listen-controller");

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
    const dir = path.resolve("public/listen");

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

/* ADD LISTEN */
router.post(
  "/addlisten",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
  ]),
  ListenController.addListen
);

/* UPDATE LISTEN */
router.patch(
  "/updatelisten/:id",
  upload.fields([
    { name: "thumbnail", maxCount: 1 },
  ]),
  ListenController.updateListen
);

/* GET ALL LISTEN DATA */
router.get(
  "/getdata/:celebrityId",
  ListenController.getdata
);

/* GET LISTEN BY ID */
router.get(
  "/getlistenByid/:id",
  ListenController.getlistenByid
);

/* DELETE LISTEN */
router.delete(
  "/deletelisten/:id",
  ListenController.deleteListen
);

/* UPDATE STATUS */
router.patch(
  "/updateStatus",
  ListenController.updateStatus
);

module.exports = router;