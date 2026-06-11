// ========================================
// MODÈLE : MESSAGE
// ========================================
// Module 5 — Système de messagerie (SM-01 à SM-06)

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Message = sequelize.define('Message', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    expediteur_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    destinataire_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    contenu: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    // SM-05 : pièce jointe (photo)
    piece_jointe: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    // SM-04 : indicateur de lecture
    lu: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
    }, {
    tableName: 'messages',
    timestamps: true
});

module.exports = Message;
