const express = require("express");
const router = express.Router();

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


module.exports = router;