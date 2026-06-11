// ========================================
// MODÈLE : UTILISATEUR
// ========================================
// Correspond à la table "utilisateurs" dans MySQL
// Gère les 4 types de comptes : pêcheur, acheteur, distributeur, restaurant
// Conforme aux exigences GU-01 et GU-07 du cahier des charges

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Utilisateur = sequelize.define('Utilisateur', {

  // Identifiant unique de chaque utilisateur
    id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
    },

  // Nom complet (exigence GU-01)
    nom: {
        type: DataTypes.STRING(100),
        allowNull: false
    },

  // Numéro de téléphone — utilisé comme identifiant de connexion (GU-03)
    telephone: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: true
    },

  // Localisation géographique (exigence GU-01)
    localisation: {
        type: DataTypes.STRING(200),
        allowNull: false
    },

  // Type de compte — détermine les rôles et permissions (GU-01 et GU-07)
    role: {
        type: DataTypes.ENUM('pecheur', 'acheteur', 'distributeur', 'livreur', 'restaurant', 'admin'),
        allowNull: false,
        defaultValue: 'acheteur'
    },

  // Mot de passe haché avec bcrypt (exigence sécurité : salt ≥ 10 rounds)
    mot_de_passe: {
        type: DataTypes.STRING(255),
        allowNull: false
    },

  // Photo de profil (optionnelle - GU-05)
    photo: {
        type: DataTypes.STRING(255),
        allowNull: true
    },

  // Description du profil (optionnelle - GU-05)
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },

  // Statut du compte (GU-06 : l'admin peut activer/suspendre/supprimer)
    statut: {
        type: DataTypes.ENUM('actif', 'suspendu', 'supprime'),
        defaultValue: 'actif'
    },

  // Code OTP pour vérification du téléphone (GU-02)
    otp_code: {
        type: DataTypes.STRING(6),
        allowNull: true
    },

  // Date d'expiration du code OTP
    otp_expiration: {
        type: DataTypes.DATE,
        allowNull: true
    },

  // Le téléphone a-t-il été vérifié par OTP ? (GU-02)
    telephone_verifie: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },

  // Nombre de tentatives de connexion échouées (GU-03 : blocage après 5 tentatives)
    tentatives_connexion: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },

  // Le compte est-il bloqué suite à trop de tentatives ? (GU-03)
    compte_bloque: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }

}, {
    tableName: 'utilisateurs',
    timestamps: true
});

module.exports = Utilisateur;
