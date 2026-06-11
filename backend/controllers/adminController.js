// ========================================
// CONTRÔLEUR : ADMINISTRATION
// ========================================
// Tableau de bord administrateur — TB-04 à TB-07

const { Utilisateur, Produit, Commande, Notification } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

// TB-04 : Statistiques globales
const getStatistiques = async (req, res) => {
    try {
        const totalUtilisateurs = await Utilisateur.count();
        const utilisateursActifs = await Utilisateur.count({ where: { statut: 'actif' } });
        const totalProduits = await Produit.count({ where: { statut: 'disponible' } });
        const totalCommandes = await Commande.count();
        const commandesEnCours = await Commande.count({
        where: { statut: { [Op.in]: ['en_attente', 'confirmee', 'en_preparation', 'en_livraison'] } }
        });
        const commandesLivrees = await Commande.count({ where: { statut: 'livree' } });
        const commandesAnnulees = await Commande.count({ where: { statut: 'annulee' } });

        // Volume total des transactions
        const volumeTransactions = await Commande.sum('prix_total', {
        where: { statut: 'livree' }
        });

        // Répartition des utilisateurs par rôle
        const repartitionRoles = await Utilisateur.findAll({
        attributes: ['role', [fn('COUNT', col('id')), 'total']],
        group: ['role']
        });

        // Commandes des 7 derniers jours
        const ilYA7jours = new Date();
        ilYA7jours.setDate(ilYA7jours.getDate() - 7);

        const commandesRecentes = await Commande.count({
        where: { createdAt: { [Op.gte]: ilYA7jours } }
        });

        // Produits par type (top 5)
        const produitsParType = await Produit.findAll({
        attributes: ['type_poisson', [fn('COUNT', col('id')), 'total']],
        group: ['type_poisson'],
        order: [[literal('total'), 'DESC']],
        limit: 5
        });

        res.json({
        utilisateurs: {
            total: totalUtilisateurs,
            actifs: utilisateursActifs,
            par_role: repartitionRoles
        },
        produits: {
            disponibles: totalProduits,
            par_type: produitsParType
        },
        commandes: {
            total: totalCommandes,
            en_cours: commandesEnCours,
            livrees: commandesLivrees,
            annulees: commandesAnnulees,
            derniers_7_jours: commandesRecentes
        },
        volume_transactions: volumeTransactions || 0
        });
    } catch (erreur) {
        console.error('Erreur stats admin :', erreur);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
    };

    // TB-06 : Cartographie des pêcheurs par région
    const getCartographie = async (req, res) => {
    try {
        const pecheurs = await Utilisateur.findAll({
        where: { role: 'pecheur', statut: 'actif' },
        attributes: ['id', 'nom', 'localisation', 'telephone', 'createdAt'],
        order: [['localisation', 'ASC']]
        });

        // Grouper par localisation
        const parRegion = {};
        pecheurs.forEach((p) => {
        const region = p.localisation.split(',')[0].trim();
        if (!parRegion[region]) parRegion[region] = [];
        parRegion[region].push(p);
        });

        res.json({ pecheurs, par_region: parRegion });
    } catch (erreur) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
    };

    // Envoyer une notification à tous les utilisateurs (NI-06)
    const envoyerNotificationGlobale = async (req, res) => {
    try {
        const { titre, contenu, type } = req.body;

        const utilisateurs = await Utilisateur.findAll({ where: { statut: 'actif' } });

        const notifications = utilisateurs.map((u) => ({
        utilisateur_id: u.id,
        type: type || 'systeme',
        titre,
        contenu
        }));

        await Notification.bulkCreate(notifications);

        res.json({ message: `Notification envoyée à ${utilisateurs.length} utilisateurs.` });
    } catch (erreur) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// Lister toutes les commandes (admin)
const getCommandes = async (req, res) => {
    try {
        const { Utilisateur: U, Produit: P } = require('../models');
        const commandes = await Commande.findAll({
            include: [
                { model: P, as: 'produit', attributes: ['type_poisson', 'etat'] },
                { model: U, as: 'acheteur', attributes: ['nom', 'telephone'] },
                { model: U, as: 'vendeur', attributes: ['nom', 'telephone'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json({ commandes });
    } catch (erreur) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

module.exports = { getStatistiques, getCartographie, envoyerNotificationGlobale, getCommandes };
