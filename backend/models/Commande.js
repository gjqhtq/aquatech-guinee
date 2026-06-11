// ========================================
// MODÈLE : COMMANDE
// ========================================
// Module 3 — Gestion des commandes (GC-01 à GC-08)

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Commande = sequelize.define('Commande', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    // ID de l'acheteur
    acheteur_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // ID du produit commandé
    produit_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // ID du pêcheur vendeur
    pecheur_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // Quantité commandée en kg
    quantite_kg: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    // Prix total de la commande
    prix_total: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // GC-04 : statuts de la commande
    statut: {
        type: DataTypes.ENUM('en_attente', 'confirmee', 'en_preparation', 'en_livraison', 'livree', 'annulee'),
        defaultValue: 'en_attente'
    },
    // GC-07 : évaluation (note de 1 à 5)
    evaluation_note: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: { min: 1, max: 5 }
    },
    // GC-07 : commentaire de l'évaluation
    evaluation_commentaire: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // Date de livraison
    date_livraison: {
        type: DataTypes.DATE,
        allowNull: true
    },
    // Lieu de livraison
    lieu_livraison: {
        type: DataTypes.STRING(200),
        allowNull: true
    },
    // ID du livreur qui a pris en charge la livraison
    livreur_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
    }, {
    tableName: 'commandes',
    timestamps: true
});

module.exports = Commande;
