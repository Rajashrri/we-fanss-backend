const express = require('express');
const router = express.Router();
const relatedPersonalityController = require('../controllers/relatedpersonality-controller');
const authenticate = require('../middlewares/auth-middleware');
const validate = require('../middlewares/validate.middleware'); 
const {
  createRelatedPersonalitySchema,
  updateRelatedPersonalitySchema,
  updateRelatedPersonalityStatusSchema,
  getAllRelatedPersonalitiesSchema,
} = require('../validations/related-personality.validation');

router.use(authenticate);

/**
 * @route   POST /api/related-personalities
 * @desc    Create a new related personality for a celebrity
 * @access  Private - Requires authentication
 * @body    { celebrity: ObjectId, relatedCelebrity: ObjectId, relationshipType: string, notes?: string, status?: number }
 */
router.post(
  '/',
  validate(createRelatedPersonalitySchema),
  relatedPersonalityController.createRelatedPersonality
);

/**
 * @route   GET /api/related-personalities/celebrity/:celebrityId
 * @desc    Get all related personalities for a specific celebrity
 * @access  Private - Requires authentication
 * @query   { page?: number, limit?: number, status?: number }
 */
router.get(
  '/celebrity/:celebrityId', 
  validate(getAllRelatedPersonalitiesSchema), 
  relatedPersonalityController.getAllRelatedPersonalities
);

/**
 * @route   GET /api/related-personalities/:id
 * @desc    Get a single related personality by ID
 * @access  Private - Requires authentication
 */
router.get('/:id', relatedPersonalityController.getRelatedPersonalityById);

/**
 * @route   PUT /api/related-personalities/:id
 * @desc    Update a related personality by ID
 * @access  Private - Requires authentication
 * @body    { celebrity?: ObjectId, relatedCelebrity?: ObjectId, relationshipType?: string, notes?: string, status?: number }
 */
router.put(
  '/:id',
  validate(updateRelatedPersonalitySchema),
  relatedPersonalityController.updateRelatedPersonality
);

/**
 * @route   PATCH /api/related-personalities/:id/status
 * @desc    Update related personality status by ID
 * @access  Private - Requires authentication
 * @body    { status: number }
 */
router.patch(
  '/:id/status',
  validate(updateRelatedPersonalityStatusSchema),
  relatedPersonalityController.updateRelatedPersonalityStatus
);

/**
 * @route   DELETE /api/related-personalities/:id
 * @desc    Delete a related personality by ID
 * @access  Private - Requires authentication
 */
router.delete('/:id', relatedPersonalityController.deleteRelatedPersonality);

module.exports = router;