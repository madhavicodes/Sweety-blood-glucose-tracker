const express = require('express');
const readingsController = require('../controllers/readings.controller');
const requireAuth = require('../middleware/requireAuth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const { readingBodySchema, listReadingsQuerySchema } = require('../validators/reading.schema');

const router = express.Router();

// All readings routes require authentication
router.use(requireAuth);

router.post('/', validate(readingBodySchema), asyncHandler(readingsController.create));
router.get('/', validate(listReadingsQuerySchema, 'query'), asyncHandler(readingsController.list));
router.get('/:id', asyncHandler(readingsController.getById));
router.put('/:id', validate(readingBodySchema), asyncHandler(readingsController.update));
router.delete('/:id', asyncHandler(readingsController.delete));

module.exports = router;
