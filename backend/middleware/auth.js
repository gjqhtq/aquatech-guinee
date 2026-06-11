// ========================================
// MIDDLEWARE D'AUTHENTIFICATION
// ========================================
// S'exécute AVANT la requête pour vérifier que l'utilisateur est connecté
// Utilise les tokens JWT (JSON Web Token)

const jwt = require('jsonwebtoken');
const { Utilisateur } = require('../models');

// Vérifie que le token JWT est présent et valide
const authentifier = async (req, res, next) => {
    try {
        // Récupérer le token dans l'en-tête "Authorization"
        // Format attendu : "Bearer eyJhbGciOi..."
        const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
        message: 'Accès refusé. Token manquant. Veuillez vous connecter.'
        });
    }

    // Extraire le token (enlever "Bearer " au début)
    const token = authHeader.split(' ')[1];

    // Vérifier que le token est valide et non expiré
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Chercher l'utilisateur dans la base de données
    const utilisateur = await Utilisateur.findByPk(decoded.id);

    if (!utilisateur) {
        return res.status(401).json({ message: 'Utilisateur introuvable.' });
    }

    if (utilisateur.statut !== 'actif') {
        return res.status(403).json({ message: 'Votre compte a été suspendu.' });
    }

    // Ajouter les infos de l'utilisateur à la requête
    // Les routes suivantes pourront utiliser req.utilisateur
    req.utilisateur = utilisateur;
    next();

    } catch (erreur) {
    if (erreur.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expiré. Veuillez vous reconnecter.' });
    }
    return res.status(401).json({ message: 'Token invalide.' });
    }
};

// Vérifie que l'utilisateur a le rôle requis
// Exemple : seul un admin peut supprimer un compte (GU-06)
const autoriser = (...roles) => {
    return (req, res, next) => {
    if (!roles.includes(req.utilisateur.role)) {
        return res.status(403).json({
        message: `Accès refusé. Rôle requis : ${roles.join(' ou ')}`
        });
    }
    next();
    };
};

module.exports = { authentifier, autoriser };
