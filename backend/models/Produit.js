// ========================================
// MODÈLE : PRODUIT HALIEUTIQUE
// ========================================
// Module 2 — Gestion des produits (GP-01 à GP-08)

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Produit = sequelize.define('Produit', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
  // GP-01 : type de poisson
    type_poisson: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    // Catégorie du produit (Poisson noble, Thon, Crustaces, etc.)
    categorie: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    // GP-01 : poids disponible en kg
    poids_kg: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    // GP-01 : prix unitaire en francs guinéens
    prix_unitaire: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // GP-01 : date de capture
    date_capture: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    // GP-01 : lieu de capture
    lieu_capture: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    // GP-01 : état du produit
    etat: {
        type: DataTypes.ENUM('frais', 'congele', 'seche'),
        allowNull: false,
        defaultValue: 'frais'
    },
    // GP-01 : photos du produit
    photos: {
        type: DataTypes.JSON,
        allowNull: true
    },
    // Statut de l'annonce
    statut: {
        type: DataTypes.ENUM('disponible', 'vendu', 'expire', 'supprime'),
        defaultValue: 'disponible'
    },
    // Description optionnelle
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    // GS-03 : seuil d'alerte stock (en kg)
    seuil_alerte: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    // ID du pêcheur propriétaire (clé étrangère)
    pecheur_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
    }, {
    tableName: 'produits',
    timestamps: true
    });

module.exports = Produit;
