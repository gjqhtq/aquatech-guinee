const express = require('express');
const router = express.Router();
const { authentifier, autoriser } = require('../middleware/auth');
const { getStatistiques, getCartographie, envoyerNotificationGlobale, getCommandes } = require('../controllers/adminController');
const { listerUtilisateurs, changerStatut } = require('../controllers/utilisateurController');

// Toutes les routes admin nécessitent le rôle admin
router.use(authentifier, autoriser('admin'));

router.get('/statistiques', getStatistiques);
router.get('/cartographie', getCartographie);
router.get('/utilisateurs', listerUtilisateurs);
router.put('/utilisateurs/:id/statut', changerStatut);
router.post('/notifications', envoyerNotificationGlobale);
router.get('/commandes', getCommandes);

module.exports = router;
