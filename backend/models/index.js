// ========================================
// FICHIER CENTRAL DES MODÈLES + RELATIONS
// ========================================

const Utilisateur = require('./Utilisateur');
const Produit = require('./Produit');
const Commande = require('./Commande');
const Message = require('./Message');
const Notification = require('./Notification');
const PreferenceNotification = require('./PreferenceNotification');

// ---- RELATIONS ----

// Un pêcheur a plusieurs produits (1-N)
Utilisateur.hasMany(Produit, { foreignKey: 'pecheur_id', as: 'produits' });
Produit.belongsTo(Utilisateur, { foreignKey: 'pecheur_id', as: 'pecheur' });

// Un acheteur a plusieurs commandes (1-N)
Utilisateur.hasMany(Commande, { foreignKey: 'acheteur_id', as: 'commandes_acheteur' });
Commande.belongsTo(Utilisateur, { foreignKey: 'acheteur_id', as: 'acheteur' });

// Un pêcheur a plusieurs commandes reçues (1-N)
Utilisateur.hasMany(Commande, { foreignKey: 'pecheur_id', as: 'commandes_pecheur' });
Commande.belongsTo(Utilisateur, { foreignKey: 'pecheur_id', as: 'vendeur' });

// Livreur ou distributeur compatible avec les commandes
Utilisateur.hasMany(Commande, { foreignKey: 'livreur_id', as: 'commandes_livreur' });
Commande.belongsTo(Utilisateur, { foreignKey: 'livreur_id', as: 'livreur' });

// Un produit a plusieurs commandes (1-N)
Produit.hasMany(Commande, { foreignKey: 'produit_id', as: 'commandes' });
Commande.belongsTo(Produit, { foreignKey: 'produit_id', as: 'produit' });

// Messages entre utilisateurs
Utilisateur.hasMany(Message, { foreignKey: 'expediteur_id', as: 'messages_envoyes' });
Utilisateur.hasMany(Message, { foreignKey: 'destinataire_id', as: 'messages_recus' });
Message.belongsTo(Utilisateur, { foreignKey: 'expediteur_id', as: 'expediteur' });
Message.belongsTo(Utilisateur, { foreignKey: 'destinataire_id', as: 'destinataire' });

// Notifications
Utilisateur.hasMany(Notification, { foreignKey: 'utilisateur_id', as: 'notifications' });
Notification.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id', as: 'utilisateur' });

// Préférences de notification
Utilisateur.hasMany(PreferenceNotification, { foreignKey: 'utilisateur_id', as: 'preferences_notification' });
PreferenceNotification.belongsTo(Utilisateur, { foreignKey: 'utilisateur_id', as: 'utilisateur' });

module.exports = {
    Utilisateur,
    Produit,
    Commande,
    Message,
    Notification,
    PreferenceNotification
};
