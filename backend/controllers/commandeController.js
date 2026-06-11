// ========================================
// CONTRÔLEUR : COMMANDES
// ========================================
// Module 3 — GC-01 à GC-08

const { Commande, Produit, Utilisateur, Notification } = require('../models');
const { Op } = require('sequelize');

// GC-01 : Passer une commande
    const passerCommande = async (req, res) => {
    try {
        const { produit_id, quantite_kg, lieu_livraison } = req.body;

        const produit = await Produit.findByPk(produit_id);
        if (!produit || produit.statut !== 'disponible') {
        return res.status(400).json({ message: 'Produit non disponible.' });
        }

        if (parseFloat(quantite_kg) > parseFloat(produit.poids_kg)) {
        return res.status(400).json({ message: 'Quantité demandée supérieure au stock.' });
        }

        const prix_total = Math.round(produit.prix_unitaire * parseFloat(quantite_kg));

        const commande = await Commande.create({
        acheteur_id: req.utilisateur.id,
        produit_id: produit.id,
        pecheur_id: produit.pecheur_id,
        quantite_kg,
        prix_total,
        lieu_livraison,
        statut: 'en_attente'
        });

        // GC-02 : Notification au pêcheur
        await Notification.create({
        utilisateur_id: produit.pecheur_id,
        type: 'commande',
        titre: 'Nouvelle commande',
        contenu: `${req.utilisateur.nom} a commandé ${quantite_kg}kg de ${produit.type_poisson}`
        });

        res.status(201).json({ message: 'Commande passée avec succès.', commande });
    } catch (erreur) {
        console.error('Erreur commande :', erreur);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
    };

    // GC-03 : Accepter ou refuser une commande (pêcheur)
    const repondreCommande = async (req, res) => {
    try {
        const { id } = req.params;
        const { action } = req.body; // 'accepter' ou 'refuser'

        const commande = await Commande.findByPk(id);
        if (!commande) {
        return res.status(404).json({ message: 'Commande introuvable.' });
        }

        if (commande.pecheur_id !== req.utilisateur.id) {
        return res.status(403).json({ message: 'Non autorisé.' });
        }

        if (action === 'accepter') {
        await commande.update({ statut: 'confirmee' });
        // Déduire du stock (GS-01)
        const produit = await Produit.findByPk(commande.produit_id);
        const nouveauPoids = parseFloat(produit.poids_kg) - parseFloat(commande.quantite_kg);
        await produit.update({
            poids_kg: Math.max(0, nouveauPoids),
            statut: nouveauPoids <= 0 ? 'vendu' : 'disponible'
        });
        } else {
        await commande.update({ statut: 'annulee' });
        }

        // Notification à l'acheteur (GC-05)
        await Notification.create({
        utilisateur_id: commande.acheteur_id,
        type: 'commande',
        titre: action === 'accepter' ? 'Commande confirmée' : 'Commande refusée',
        contenu: action === 'accepter'
            ? 'Votre commande a été acceptée. Préparation en cours.'
            : 'Votre commande a été refusée par le pêcheur.'
        });

        res.json({ message: `Commande ${action === 'accepter' ? 'acceptée' : 'refusée'}.`, commande });
    } catch (erreur) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
    };

    // GC-04 : Mettre à jour le statut de la commande
    const mettreAJourStatut = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;

        const commande = await Commande.findByPk(id);
        if (!commande) {
        return res.status(404).json({ message: 'Commande introuvable.' });
        }

        await commande.update({
        statut,
        date_livraison: statut === 'livree' ? new Date() : commande.date_livraison
        });

        // Notification (GC-05)
        await Notification.create({
        utilisateur_id: commande.acheteur_id,
        type: 'commande',
        titre: 'Mise à jour commande',
        contenu: `Votre commande est maintenant : ${statut.replace('_', ' ')}`
        });

        res.json({ message: 'Statut mis à jour.', commande });
    } catch (erreur) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
    };

    // GC-06 : Annuler une commande (acheteur, avant confirmation)
    const annulerCommande = async (req, res) => {
    try {
        const commande = await Commande.findByPk(req.params.id);

        if (!commande || commande.acheteur_id !== req.utilisateur.id) {
        return res.status(403).json({ message: 'Non autorisé.' });
        }

        if (commande.statut !== 'en_attente') {
        return res.status(400).json({ message: 'Impossible d\'annuler une commande déjà confirmée.' });
        }

        await commande.update({ statut: 'annulee' });
        res.json({ message: 'Commande annulée.' });
    } catch (erreur) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
    };

    // GC-07 : Évaluer une commande
    const evaluerCommande = async (req, res) => {
    try {
        const { note, commentaire } = req.body;
        const commande = await Commande.findByPk(req.params.id);

        if (!commande || commande.acheteur_id !== req.utilisateur.id) {
        return res.status(403).json({ message: 'Non autorisé.' });
        }

        if (commande.statut !== 'livree') {
        return res.status(400).json({ message: 'On ne peut évaluer que les commandes livrées.' });
        }

        await commande.update({ evaluation_note: note, evaluation_commentaire: commentaire });
        res.json({ message: 'Évaluation enregistrée. Merci !' });
    } catch (erreur) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
    };

    // GC-08 : Historique des commandes
    const historiqueCommandes = async (req, res) => {
    try {
        const role = req.utilisateur.role;
        let where;

        if (role === 'pecheur') {
            where = { pecheur_id: req.utilisateur.id };
        } else if (role === 'livreur') {
            where = { livreur_id: req.utilisateur.id };
        } else if (role === 'distributeur') {
            where = { statut: { [Op.in]: ['confirmee', 'en_livraison'] } };
        } else {
            where = { acheteur_id: req.utilisateur.id };
        }

        const commandes = await Commande.findAll({
        where,
        include: [
            { model: Produit, as: 'produit', attributes: ['type_poisson', 'photos', 'etat'] },
            { model: Utilisateur, as: 'acheteur', attributes: ['nom', 'telephone'] },
            { model: Utilisateur, as: 'vendeur', attributes: ['nom', 'telephone'] }
        ],
        order: [['createdAt', 'DESC']]
        });

        res.json({ commandes });
    } catch (erreur) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
    };

    module.exports = {
    passerCommande,
    repondreCommande,
    mettreAJourStatut,
    annulerCommande,
    evaluerCommande,
    historiqueCommandes
};
