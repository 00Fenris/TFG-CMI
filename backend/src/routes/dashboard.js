const express = require('express');
const router = express.Router();
const { restaurantSummary, globalSummary } = require('../controllers/dashboardController');
const { requireAuth } = require('../middleware/auth');

router.get('/restaurant/:restaurantId', requireAuth, restaurantSummary);
router.get('/global', requireAuth, globalSummary);

module.exports = router;
