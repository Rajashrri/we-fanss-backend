const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const bodyparser = require("body-parser");
const validate = require("../middlewares/validate.middleware");
router.use(bodyparser.urlencoded({ extended: true }));
router.use(express.static(path.resolve(__dirname, 'public')));

// Multer setup for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "public/userprofile";
    if (!fs.existsSync("public")) fs.mkdirSync("public");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: storage });
const {
   getSavedCelebrityCount,
  getFollowedCount,
    getFollowedCelebrities,
  getFollowedCelebritiesall,
  addRecentView,
  getRecentViews,
  getCollectionsHome,
  getUserCollections,
  getCollectionDetails,
   getProfile,
  updateProfile,
} = require("../controllers/user-controller");


// --------------------------------- user dashboard -------------------------------------------------------------------------



router.get(
  "/saved-count/:userId",
  getSavedCelebrityCount
);

router.get(
  "/followed-count/:userId",
  getFollowedCount
);



router.get(
  "/follow/followed/:userId",
  getFollowedCelebrities
);

router.get(
  "/allfollowed/:userId",
  getFollowedCelebritiesall
);

router.post("/recent-view/add", addRecentView);

router.get(
  "/recent-view/:userId",
  getRecentViews
);

router.get(
  "/collectionhome/:userId",
  getCollectionsHome
);

router.get(
  "/allcollection/:userId",
  getUserCollections
);
router.get(
  "/collection-details/:slug",
  getCollectionDetails
);
router.get("/profile/:userId", getProfile);


router.patch(
  "/profile/update/:userId",
  upload.fields([
    { name: "profileImage", maxCount: 1 },
  ]),
  updateProfile
);



module.exports = router;