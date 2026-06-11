const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const PreferenceNotification = sequelize.define('PreferenceNotification', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    utilisateur_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'utilisateurs', key: 'id' }
    },
    type: {
        type: DataTypes.ENUM(
            'commande',      // Notifications de commandes
            'message',       // Messages reçus
            'stock',         // Alertes de stock bas
            'produit',       // Alertes produit non vendu
            'evaluation',    // Nouvelles évaluations
            'sanitaire',     // Alertes sanitaires
            'promo',         // Promotions et offres
            'systeme'        // Notifications système
        ),
        allowNull: false,
        defaultValue: 'commande'
    },
    enabled: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Si l\'utilisateur veut recevoir ce type de notification'
    },
    canal: {
        type: DataTypes.ENUM('app', 'sms', 'email'),
        defaultValue: 'app',
        comment: 'Canal de livraison (dans l\'app, SMS, ou email)'
    },
    frequence: {
        type: DataTypes.ENUM('immediat', 'quotidien', 'hebdo'),
        defaultValue: 'immediat',
        comment: 'Fréquence d\'envoi'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
        tableName: 'preference_notifications',
    indexes: [
        { fields: ['utilisateur_id'] },
        { fields: ['utilisateur_id', 'type'], unique: true }
    ]
});

module.exports = PreferenceNotification;
