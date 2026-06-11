const express = require('express');
const router = express.Router();
const { authentifier } = require('../middleware/auth');
const {
    passerCommande, repondreCommande, mettreAJourStatut,
    annulerCommande, evaluerCommande, historiqueCommandes
} = require('../controllers/commandeController');

// Routes sans paramètre d'ID en premier
router.post('/', authentifier, passerCommande);
router.get('/historique', authentifier, historiqueCommandes);

// Routes avec :id après
router.put('/:id/repondre', authentifier, repondreCommande);
router.put('/:id/statut', authentifier, mettreAJourStatut);
router.put('/:id/annuler', authentifier, annulerCommande);
router.post('/:id/evaluer', authentifier, evaluerCommande);

// Route pour les distributeurs : commandes confirmées disponibles à livrer
router.get('/livraisons/disponibles', authentifier, async (req, res) => {
    try {
        const { Commande, Produit, Utilisateur } = require('../models');
        const commandes = await Commande.findAll({
            where: { statut: 'confirmee' },
            include: [
                { model: Produit, as: 'produit', attributes: ['type_poisson', 'etat'] },
                { model: Utilisateur, as: 'acheteur', attributes: ['nom', 'telephone', 'localisation'] },
                { model: Utilisateur, as: 'vendeur', attributes: ['nom', 'telephone', 'localisation'] }
            ],
            order: [['createdAt', 'ASC']]
        });
        res.json({ commandes });
    } catch (e) { res.status(500).json({ message: 'Erreur serveur.' }); }
});

// Distributeur/livreur prend en charge une livraison
router.put('/:id/prendre-livraison', authentifier, async (req, res) => {
    try {
        const { Commande } = require('../models');
        const commande = await Commande.findByPk(req.params.id);
        if (!commande) return res.status(404).json({ message: 'Commande introuvable.' });
        if (commande.statut !== 'confirmee') return res.status(400).json({ message: 'Cette commande n\'est plus disponible.' });
        await commande.update({ statut: 'en_livraison', livreur_id: req.utilisateur.id });
        res.json({ message: 'Livraison prise en charge.', commande });
    } catch (e) { res.status(500).json({ message: 'Erreur serveur.' }); }
});

// Distributeur/livreur marque comme livrée
router.put('/:id/marquer-livree', authentifier, async (req, res) => {
    try {
        const { Commande } = require('../models');
        const commande = await Commande.findByPk(req.params.id);
        if (!commande) return res.status(404).json({ message: 'Commande introuvable.' });
        if (commande.livreur_id !== req.utilisateur.id) return res.status(403).json({ message: 'Non autorisé.' });
        await commande.update({ statut: 'livree', date_livraison: new Date() });
        res.json({ message: 'Commande marquée comme livrée.', commande });
    } catch (e) { res.status(500).json({ message: 'Erreur serveur.' }); }
});

// Mes livraisons en cours (livreur connecté)
router.get('/livraisons/mes-livraisons', authentifier, async (req, res) => {
    try {
        const { Commande, Produit, Utilisateur } = require('../models');
        const commandes = await Commande.findAll({
            where: { livreur_id: req.utilisateur.id, statut: 'en_livraison' },
            include: [
                { model: Produit, as: 'produit', attributes: ['type_poisson', 'etat'] },
                { model: Utilisateur, as: 'acheteur', attributes: ['nom', 'telephone', 'localisation'] },
                { model: Utilisateur, as: 'vendeur', attributes: ['nom', 'telephone', 'localisation'] }
            ],
            order: [['updatedAt', 'DESC']]
        });
        res.json({ commandes });
    } catch (e) { res.status(500).json({ message: 'Erreur serveur.' }); }
});

module.exports = router;
