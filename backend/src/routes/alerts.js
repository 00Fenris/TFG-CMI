const express = require('express');
const router = express.Router();
const { list, summary, acknowledge } = require('../controllers/alertController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, list);
router.get('/summary', requireAuth, summary);
router.put('/:id/acknowledge', requireAuth, acknowledge);

module.exports = router;
