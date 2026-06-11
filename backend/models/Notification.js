// ========================================
// MODÈLE : NOTIFICATION
// ========================================
// Module 6 — Notifications intelligentes (NI-01 à NI-06)

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    utilisateur_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // Type de notification
    type: {
        type: DataTypes.ENUM('commande', 'message', 'stock', 'meteo', 'sanitaire', 'promo', 'systeme'),
        allowNull: false
    },
    titre: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    contenu: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    lu: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
    }, {
    tableName: 'notifications',
    timestamps: true
});

module.exports = Notification;
