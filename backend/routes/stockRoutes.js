const express = require('express');
const router = express.Router();
const { authentifier } = require('../middleware/auth');
const {
  mesStocks,
  changerSeuilAlerte,
  mettreAJourStock,
  rapportHebdo,
  stocksGlobaux
} = require('../controllers/stockController');

// Pêcheur : consulter ses stocks
router.get('/mes-stocks', authentifier, mesStocks);

// Pêcheur : paramétrer le seuil d'alerte
router.put('/seuil', authentifier, changerSeuilAlerte);

// Pêcheur : mettre à jour stock (vente hors plateforme)
router.put('/maj-manuel', authentifier, mettreAJourStock);

// Pêcheur : rapport hebdomadaire
router.get('/rapport-hebdo', authentifier, rapportHebdo);

// Admin : vue consolidée des stocks
router.get('/globaux', authentifier, stocksGlobaux);

module.exports = router;
