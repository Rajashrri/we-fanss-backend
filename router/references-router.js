const express = require('express');
const router = express.Router();
const referenceController = require('../controllers/references-controller');
const authenticate = require('../middlewares/auth-middleware');
const validate = require('../middlewares/validate.middleware'); 
const {
  createReferenceSchema,
  updateReferenceSchema,
  updateReferenceStatusSchema,
  getAllReferencesSchema,
} = require('../validations/references.validation');

router.use(authenticate);

/**
 * @route   POST /api/references
 * @desc    Create a new reference for a celebrity
 * @access  Private - Requires authentication
 * @body    { celebrity: ObjectId, title: string, url: string, type?: string, status?: number }
 */
router.post(
  '/',
  validate(createReferenceSchema),
  referenceController.createReference
);

/**
 * @route   GET /api/references/celebrity/:celebrityId
 * @desc    Get all references for a specific celebrity
 * @access  Private - Requires authentication
 * @query   { page?: number, limit?: number, status?: number }
 */
router.get(
  '/celebrity/:celebrityId', 
  validate(getAllReferencesSchema), 
  referenceController.getAllReferences
);

/**
 * @route   GET /api/references/:id
 * @desc    Get a single reference by ID
 * @access  Private - Requires authentication
 */
router.get('/:id', referenceController.getReferenceById);

/**
 * @route   PUT /api/references/:id
 * @desc    Update a reference by ID
 * @access  Private - Requires authentication
 * @body    { title?: string, url?: string, type?: string, status?: number }
 */
router.put(
  '/:id',
  validate(updateReferenceSchema),
  referenceController.updateReference
);

/**
 * @route   PATCH /api/references/:id/status
 * @desc    Update reference status by ID
 * @access  Private - Requires authentication
 * @body    { status: number }
 */
router.patch(
  '/:id/status',
  validate(updateReferenceStatusSchema),
  referenceController.updateReferenceStatus
);

/**
 * @route   DELETE /api/references/:id
 * @desc    Delete a reference by ID
 * @access  Private - Requires authentication
 */
router.delete('/:id', referenceController.deleteReference);

module.exports = router;