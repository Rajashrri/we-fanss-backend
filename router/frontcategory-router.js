const express = require("express");

const router = express.Router();

const {
  getCelebritiesByCategory,
  getCelebrityBySlug,
  getTimelineByCelebrity, getTriviaByCelebrity,getReferencesByCelebrity, getLatestWatchByCelebrity, 
  getRelatedPersonalitiesByCelebrity,getFeaturedMoviesByCelebrity, getFeaturedSeriesByCelebrity,getLatestReadByCelebrity,
  getLatestListenByCelebrity,getWatchByCelebrity,getReadByCelebrity,getListenByCelebrity,getLatestElectionByCelebrity,getLatestPositionByCelebrity

} = require("../controllers/frontcategory-controller");

router.get("/frontcategory/:slug", getCelebritiesByCategory);

// ✅ celebrity details by slug
router.get("/celebrity/:slug", getCelebrityBySlug);

// ✅ timeline by celebrity id
router.get("/timeline/:celebrityId", getTimelineByCelebrity);
router.get("/trivia/:celebrityId", getTriviaByCelebrity);

router.get(
  "/references/:id",
  getReferencesByCelebrity
);
router.get(
  "/featured-movies/:celebrityId",
  getFeaturedMoviesByCelebrity
);
// ✅ ADD THIS
router.get(
  "/related-personalities/:id",
  getRelatedPersonalitiesByCelebrity
);
router.get(
  "/featured-series/:celebrityId",
 getFeaturedSeriesByCelebrity
);


router.get(
  "/latest-watch/:id",
  getLatestWatchByCelebrity
);
router.get("/latest-read/:celebrityId", getLatestReadByCelebrity);
router.get(
  "/latest-listen/:celebrityId",
  getLatestListenByCelebrity
);

router.get("/watch/:celebrityId", getWatchByCelebrity);
router.get("/read/:celebrityId", getReadByCelebrity);
router.get(
  "/listen/:celebrityId",
  getListenByCelebrity
);
router.get("/latest-election/:celebrityId", getLatestElectionByCelebrity);

router.get(
  "/latest-position/:celebrityId",
  getLatestPositionByCelebrity
);


module.exports = router;