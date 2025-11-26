const express = require('express');
const router = express.Router();
const { list, create, update } = require('../controllers/taskController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, list);
router.post('/', requireAuth, create);
router.put('/:id', requireAuth, update);

module.exports = router;
