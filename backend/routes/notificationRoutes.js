const express = require('express');
const router = express.Router();
const { authentifier } = require('../middleware/auth');
const { getNotifications, marquerLue, marquerToutesLues } = require('../controllers/notificationController');

router.get('/', authentifier, getNotifications);
router.put('/toutes-lues', authentifier, marquerToutesLues); // AVANT /:id
router.put('/:id/lue', authentifier, marquerLue);

module.exports = router;
