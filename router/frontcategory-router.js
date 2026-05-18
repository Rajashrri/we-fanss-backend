const express = require("express");

const router = express.Router();

const {
  getCelebritiesByCategory,
  getCelebrityBySlug,
  getTimelineByCelebrity, getTriviaByCelebrity,getReferencesByCelebrity,  getRelatedPersonalitiesByCelebrity, // ✅ add

} = require("../controllers/frontcategory-controller");

router.get("/frontcategory/:slug", getCelebritiesByCategory);

// ✅ celebrity details by slug
router.get("/celebrity/:slug", getCelebrityBySlug);

// ✅ timeline by celebrity id
router.get("/timeline/:celebrityId", getTimelineByCelebrity);
router.get("/trivia/:celebrityId", getTriviaByCelebrity);

router.get(
  "/references/:celebrityId",
  getReferencesByCelebrity
);

// ✅ ADD THIS
router.get(
  "/related-personalities/:id",
  getRelatedPersonalitiesByCelebrity
);
module.exports = router;