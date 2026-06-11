// ========================================
// CONTRÔLEUR : PRODUITS
// ========================================
// Module 2 — GP-01 à GP-08

const { Produit, Utilisateur } = require('../models');
const { validationResult } = require('express-validator');

const buildPhotoUrls = (files) => {
  if (!files || files.length === 0) return null;
  return files.map(file => `/api/uploads/products/${file.filename}`);
};

// GP-01 : Ajouter un produit (pêcheur uniquement)
const ajouterProduit = async (req, res) => {
    try {
        const erreurs = validationResult(req);
        if (!erreurs.isEmpty()) {
        return res.status(400).json({ erreurs: erreurs.array() });
        }

        const { type_poisson, poids_kg, prix_unitaire, date_capture, lieu_capture, etat, description } = req.body;
        const photos = buildPhotoUrls(req.files);

        const produit = await Produit.create({
        type_poisson,
        poids_kg,
        prix_unitaire,
        date_capture,
        lieu_capture,
        etat: etat || 'frais',
        description,
        photos,
        pecheur_id: req.utilisateur.id,
        statut: 'disponible'
        });

        res.status(201).json({ message: 'Produit ajouté avec succès.', produit });
    } catch (erreur) {
        console.error('Erreur ajout produit :', erreur);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// GP-02 : Modifier un produit
const modifierProduit = async (req, res) => {
    try {
        const { id } = req.params;
        const produit = await Produit.findByPk(id);

        if (!produit) {
        return res.status(404).json({ message: 'Produit introuvable.' });
        }

        if (produit.pecheur_id !== req.utilisateur.id && req.utilisateur.role !== 'admin') {
        return res.status(403).json({ message: 'Non autorisé.' });
        }

        const photos = buildPhotoUrls(req.files);
        const updates = { ...req.body };
        if (photos) updates.photos = photos;

        await produit.update(updates);
        res.json({ message: 'Produit mis à jour.', produit });
    } catch (erreur) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// GP-03 : Marquer comme vendu ou supprimer
const changerStatutProduit = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;
        const produit = await Produit.findByPk(id);

        if (!produit) {
        return res.status(404).json({ message: 'Produit introuvable.' });
        }

        if (produit.pecheur_id !== req.utilisateur.id && req.utilisateur.role !== 'admin') {
        return res.status(403).json({ message: 'Non autorisé.' });
        }

        await produit.update({ statut });
        res.json({ message: `Produit marqué comme ${statut}.`, produit });
    } catch (erreur) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// GP-04 + GP-06 : Catalogue — lister et filtrer les produits
const listerProduits = async (req, res) => {
    try {
        const { type, lieu, etat, prix_min, prix_max, recherche } = req.query;

        const where = { statut: 'disponible' };

        if (type) where.type_poisson = type;
        if (lieu) where.lieu_capture = { [require('sequelize').Op.like]: `%${lieu}%` };
        if (etat) where.etat = etat;
        if (prix_min || prix_max) {
            where.prix_unitaire = {};
            if (prix_min) where.prix_unitaire[[require('sequelize').Op.gte]] = parseInt(prix_min);
            if (prix_max) where.prix_unitaire[[require('sequelize').Op.lte]] = parseInt(prix_max);
            }
            if (recherche) {
            where[require('sequelize').Op.or] = [
            { type_poisson: { [require('sequelize').Op.like]: `%${recherche}%` } },
            { lieu_capture: { [require('sequelize').Op.like]: `%${recherche}%` } }
            ];
        }

        const produits = await Produit.findAll({
            where,
            include: [{ model: Utilisateur, as: 'pecheur', attributes: ['id', 'nom', 'localisation'] }],
            order: [['createdAt', 'DESC']]
        });

    res.json({ produits, total: produits.length });
    } catch (erreur) {
    console.error('Erreur liste produits :', erreur);
    res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// GP-05 : Détail d'un produit
const detailProduit = async (req, res) => {
    try {
        const produit = await Produit.findByPk(req.params.id, {
        include: [{ model: Utilisateur, as: 'pecheur', attributes: ['id', 'nom', 'localisation', 'telephone'] }]
        });

        if (!produit) {
        return res.status(404).json({ message: 'Produit introuvable.' });
        }

        res.json(produit);
    } catch (erreur) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// Lister les produits d'un pêcheur
const mesProduits = async (req, res) => {
    try {
        const produits = await Produit.findAll({
        where: { pecheur_id: req.utilisateur.id },
        order: [['createdAt', 'DESC']]
        });
        res.json({ produits });
    } catch (erreur) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

module.exports = {
    ajouterProduit,
    modifierProduit,
    changerStatutProduit,
    listerProduits,
    detailProduit,
    mesProduits
    };
