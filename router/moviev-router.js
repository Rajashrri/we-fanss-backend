const express = require("express");
const router = express.Router();
const movieController = require("../controllers/moviev-controller");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const authenticate = require("../middlewares/auth-middleware");
const { checkPrivilege } = require("../middlewares/privilege-middleware");
const {
  PRIVILEGE_RESOURCES,
  OPERATIONS,
} = require("../utils/constant/privilege-constant");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "public/movies";
    if (!fs.existsSync("public")) fs.mkdirSync("public");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// ✅ Apply authentication to all routes
router.use(authenticate);

/**
 * @route   POST /api/movie
 * @desc    Create a new movie
 * @access  Private - Requires ADD permission on CELEBRITY_PROFESSION_SECTIONS resource
 * @body    { title, description, releaseDate, celebrity, etc. } + image file
 */
router.post(
  "/",
  checkPrivilege(
    PRIVILEGE_RESOURCES.CELEBRITY_PROFESSION_SECTIONS,
    OPERATIONS.ADD
  ),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "imagebg", maxCount: 1 },
  ]),
  movieController.addMovie
);

/**
 * @route   GET /api/movie
 * @desc    Get all movies
 * @access  Private - Requires ADD permission on CELEBRITY_PROFESSION_SECTIONS resource
 * @query   { page?, limit?, status?, search? }
 */
router.get(
  "/",
  checkPrivilege(
    PRIVILEGE_RESOURCES.CELEBRITY_PROFESSION_SECTIONS,
    OPERATIONS.ADD,
  ),
  movieController.getMovies,
);

/**
 * @route   GET /api/movie/celebrity/:celebrity
 * @desc    Get all movies by celebrity
 * @access  Private
 * @params  celebrity - Celebrity ID
 */
router.get("/celebrity/:celebrity", movieController.getMoviesByCelebrity);

/**
 * @route   GET /api/movie/:id
 * @desc    Get a single movie by ID
 * @access  Private - Requires ADD permission on CELEBRITY_PROFESSION_SECTIONS resource
 * @params  id - Movie ID
 */
router.get(
  "/:id",
  checkPrivilege(
    PRIVILEGE_RESOURCES.CELEBRITY_PROFESSION_SECTIONS,
    OPERATIONS.ADD,
  ),
  movieController.getMovieById,
);

/**
 * @route   PATCH /api/movie/:id
 * @desc    Update an existing movie
 * @access  Private - Requires EDIT permission on CELEBRITY_PROFESSION_SECTIONS resource
 * @params  id - Movie ID
 * @body    { title?, description?, releaseDate?, status?, etc. } + image file (optional)
 */
router.patch(
  "/:id",
  checkPrivilege(
    PRIVILEGE_RESOURCES.CELEBRITY_PROFESSION_SECTIONS,
    OPERATIONS.EDIT
  ),
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "imagebg", maxCount: 1 }
  ]),
  movieController.updateMovie
);
/**
 * @route   PATCH /api/movie/status/:id
 * @desc    Update movie status only
 * @access  Private - Requires EDIT permission on CELEBRITY_PROFESSION_SECTIONS resource
 * @params  id - Movie ID
 * @body    { status }
 */
router.patch(
  "/status/:id",
  checkPrivilege(
    PRIVILEGE_RESOURCES.CELEBRITY_PROFESSION_SECTIONS,
    OPERATIONS.EDIT,
  ),
  movieController.updateStatus,
);


router.patch(
  "/featured/:id",
  checkPrivilege(
    PRIVILEGE_RESOURCES.CELEBRITY_PROFESSION_SECTIONS,
    OPERATIONS.EDIT,
  ),
  movieController.  updateMovieFeatured,

);

/**
 * @route   DELETE /api/movie/:id
 * @desc    Delete a movie
 * @access  Private - Requires DELETE permission on CELEBRITY_PROFESSION_SECTIONS resource
 * @params  id - Movie ID
 */
router.delete(
  "/:id",
  checkPrivilege(
    PRIVILEGE_RESOURCES.CELEBRITY_PROFESSION_SECTIONS,
    OPERATIONS.DELETE,
  ),
  movieController.deleteMovie,
);

module.exports = router;
