// ========================================
// ROUTES : PRÉFÉRENCES NOTIFICATIONS
// ========================================
// NI-05 : Endpoints pour gérer les préférences de notification

const express = require('express');
const router = express.Router();
const { authentifier } = require('../middleware/auth');
const {
    getPreferences,
    updatePreference,
    resetPreferences
} = require('../controllers/preferencesNotificationController');

// ---- ROUTES PROTÉGÉES ----

// NI-05 : Récupérer les préférences de l'utilisateur
router.get('/', authentifier, getPreferences);

// NI-05 : Mettre à jour une préférence
router.put('/:type', authentifier, updatePreference);

// NI-05 : Réinitialiser les préférences
router.post('/reset/all', authentifier, resetPreferences);

module.exports = router;
