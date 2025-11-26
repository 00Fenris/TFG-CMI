const express = require('express');
const router = express.Router();
const { list } = require('../controllers/alertController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, list);

module.exports = router;
