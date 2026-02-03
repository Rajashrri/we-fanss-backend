const express = require("express");
const router = express.Router();
const GenreMaster = require("../controllers/genremaster-controller");
const authenticate = require("../middlewares/auth-middleware");
const { checkPrivilege } = require("../middlewares/privilege-middleware");
const { RESOURCES, OPERATIONS } = require("../utils/constant/privilege-constant");
const validate = require("../middlewares/validate.middleware");
const {
  createGenreMasterSchema,
  updateGenreMasterSchema,
  updateStatusGenreMasterSchema,
  getGenreMasterByIdSchema,
  deleteGenreMasterSchema,
  getAllGenreMasterSchema
} = require("../validations/genre.validation");



router.use(authenticate);



/**
 * @route   POST /api/genremaster/addGenreMaster
 * @desc    Create a new genre
 * @access  Private - Requires ADD permission on GENRE resource
 * @body    { name }
 */
router.post(
  "/addGenreMaster",
  checkPrivilege(RESOURCES.GENRE, OPERATIONS.ADD),
  validate(createGenreMasterSchema),
  GenreMaster.addGenreMaster
);

/**
 * @route   GET /api/genremaster/getdataGenreMaster
 * @desc    Get all genres
 * @access  Private - Anyone with access to genre resource
 * @query   { page?, limit?, search? }
 */
router.get(
  "/getdataGenreMaster",
  checkPrivilege(RESOURCES.GENRE, OPERATIONS.ADD),
  validate(getAllGenreMasterSchema),
  GenreMaster.getdataGenreMaster
);

/**
 * @route   GET /api/genremaster/getGenreMasterByid/:id
 * @desc    Get a single genre by ID
 * @access  Private - Anyone with access to genre resource
 * @params  id - Genre ID
 */
router.get(
  "/getGenreMasterByid/:id",
  checkPrivilege(RESOURCES.GENRE, OPERATIONS.ADD),
  validate(getGenreMasterByIdSchema),
  GenreMaster.getGenreMasterByid
);

/**
 * @route   PATCH /api/genremaster/updateGenreMaster/:id
 * @desc    Update an existing genre
 * @access  Private - Requires EDIT permission on GENRE resource
 * @params  id - Genre ID
 * @body    { name }
 */
router.patch(
  "/updateGenreMaster/:id",
  checkPrivilege(RESOURCES.GENRE, OPERATIONS.EDIT),
  validate(updateGenreMasterSchema),
  GenreMaster.updateCategory
);

/**
 * @route   DELETE /api/genremaster/deleteGenreMaster/:id
 * @desc    Delete a genre
 * @access  Private - Requires DELETE permission on GENRE resource
 * @params  id - Genre ID
 */
router.delete(
  "/deleteGenreMaster/:id",
  checkPrivilege(RESOURCES.GENRE, OPERATIONS.DELETE),
  validate(deleteGenreMasterSchema),
  GenreMaster.deleteGenreMaster
);

/**
 * @route   PATCH /api/genremaster/update-statuscategory
 * @desc    Update genre status (active/inactive)
 * @access  Private - Requires EDIT permission on GENRE resource
 * @body    { id, status }
 */
router.patch(
  "/update-statuscategory",
  checkPrivilege(RESOURCES.GENRE, OPERATIONS.EDIT),
  validate(updateStatusGenreMasterSchema),
  GenreMaster.updateStatusCategory
);

module.exports = router;