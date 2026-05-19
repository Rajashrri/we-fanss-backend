const express = require("express");

const router = express.Router();

const {
  getCelebritiesByCategory,
  getCelebrityBySlug,
  getTimelineByCelebrity, getTriviaByCelebrity,getReferencesByCelebrity,  getRelatedPersonalitiesByCelebrity,getFeaturedMoviesByCelebrity, getFeaturedSeriesByCelebrity

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

module.exports = router;