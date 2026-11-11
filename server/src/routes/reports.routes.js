const express = require('express');
const reportController = require('../controllers/report.controller');
const requireAuth = require('../middleware/requireAuth');
const validate = require('../middleware/validate');
const asyncHandler = require('../utils/asyncHandler');
const { reportQuerySchema } = require('../validators/report.schema');

const router = express.Router();

// All report routes require authentication
router.use(requireAuth);

router.get('/daily', validate(reportQuerySchema, 'query'), asyncHandler(reportController.daily));
router.get('/month-to-date', validate(reportQuerySchema, 'query'), asyncHandler(reportController.monthToDate));
router.get('/monthly', validate(reportQuerySchema, 'query'), asyncHandler(reportController.monthly));

module.exports = router;
