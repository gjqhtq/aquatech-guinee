// ========================================
// ROUTES : UTILISATEURS
// ========================================
// Définit les URL de l'API pour la gestion des utilisateurs

const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { authentifier, autoriser } = require('../middleware/auth');
const {
    inscrire,
    verifierOTP,
    connecter,
    getProfil,
    modifierProfil,
    listerUtilisateurs,
    changerStatut,
    getStatsPecheur
} = require('../controllers/utilisateurController');

// ---- VALIDATION DES DONNÉES ----

const validationInscription = [
    body('nom').trim().notEmpty().withMessage('Le nom est obligatoire.'),
    body('telephone').trim().notEmpty().withMessage('Le téléphone est obligatoire.'),
    body('localisation').trim().notEmpty().withMessage('La localisation est obligatoire.'),
    body('mot_de_passe')
    .isLength({ min: 6 })
    .withMessage('Le mot de passe doit contenir au moins 6 caractères.'),
    body('role')
    .optional()
    .isIn(['pecheur', 'acheteur', 'distributeur', 'restaurant', 'livreur'])
    .withMessage('Rôle invalide.')
];

const validationConnexion = [
    body('telephone').trim().notEmpty().withMessage('Le téléphone est obligatoire.'),
    body('mot_de_passe').notEmpty().withMessage('Le mot de passe est obligatoire.')
];

// ---- ROUTES PUBLIQUES (pas besoin d'être connecté) ----

// Créer un compte (GU-01)
router.post('/inscription', validationInscription, inscrire);

// Vérifier le code OTP (GU-02)
router.post('/verifier-otp', verifierOTP);

// Se connecter (GU-03)
router.post('/connexion', validationConnexion, connecter);

// ---- ROUTES PROTÉGÉES (token JWT requis) ----

// Voir son profil (GU-05)
router.get('/profil', authentifier, getProfil);

// Modifier son profil (GU-05)
router.put('/profil', authentifier, modifierProfil);

// Stats du pêcheur pour le tableau de bord (TB-01 à TB-03)
router.get('/stats-pecheur', authentifier, getStatsPecheur);

// ---- ROUTES ADMIN ----

// Lister tous les utilisateurs (GU-06)
router.get('/admin/tous', authentifier, autoriser('admin'), listerUtilisateurs);

// Activer/Suspendre/Supprimer un compte (GU-06)
router.put('/admin/:id/statut', authentifier, autoriser('admin'), changerStatut);

module.exports = router;
