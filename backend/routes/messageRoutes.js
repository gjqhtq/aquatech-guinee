const express = require('express');
const router = express.Router();
const { authentifier } = require('../middleware/auth');
const { envoyerMessage, getConversations, getMessagesAvec } = require('../controllers/messageController');
const { Utilisateur } = require('../models');

router.post('/', authentifier, envoyerMessage);
router.get('/conversations', authentifier, getConversations);
router.get('/conversations/:contactId', authentifier, getMessagesAvec);

// Lister les utilisateurs contactables (pour démarrer une nouvelle conversation)
router.get('/utilisateurs', authentifier, async (req, res) => {
    try {
        const utilisateurs = await Utilisateur.findAll({
            where: { statut: 'actif' },
            attributes: ['id', 'nom', 'role', 'localisation'],
            order: [['nom', 'ASC']]
        });
        // Exclure l'utilisateur connecté
        res.json({ utilisateurs: utilisateurs.filter(u => u.id !== req.utilisateur.id) });
    } catch (e) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
});

module.exports = router;
