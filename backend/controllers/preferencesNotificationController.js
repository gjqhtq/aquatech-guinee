// ========================================
// CONTRÔLEUR : PRÉFÉRENCES NOTIFICATIONS
// ========================================
// NI-05 : Gestion des préférences de notification par l'utilisateur

const { PreferenceNotification } = require('../models');
const { Op } = require('sequelize');

// Types de notification disponibles
const TYPES_NOTIF = [
    'commande',      // Notifications de commandes
    'message',       // Messages reçus
    'stock',         // Alertes de stock bas
    'produit',       // Alertes produit non vendu
    'evaluation',    // Nouvelles évaluations
    'sanitaire',     // Alertes sanitaires
    'promo',         // Promotions et offres
    'systeme'        // Notifications système
];

// NI-05 : Récupérer les préférences de l'utilisateur
const getPreferences = async (req, res) => {
    try {
        const utilisateur_id = req.utilisateur.id;

        // Récupérer les préférences existantes
        const prefs = await PreferenceNotification.findAll({
            where: { utilisateur_id },
            attributes: ['type', 'enabled', 'canal', 'frequence']
        });

        // Si pas de préférences, créer les defaults
        if (prefs.length === 0) {
            const prefsDefault = await Promise.all(
                TYPES_NOTIF.map(type =>
                    PreferenceNotification.create({
                        utilisateur_id,
                        type,
                        enabled: true,
                        canal: type === 'systeme' ? 'app' : 'app',
                        frequence: type === 'commande' || type === 'message' ? 'immediat' : 'quotidien'
                    })
                )
            );
            return res.json({ preferences: prefsDefault });
        }

        res.json({ preferences: prefs });
    } catch (erreur) {
        console.error('Erreur fetch prefs :', erreur);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// NI-05 : Mettre à jour une préférence
const updatePreference = async (req, res) => {
    try {
        const utilisateur_id = req.utilisateur.id;
        const { type, enabled, canal, frequence } = req.body;

        // Valider les inputs
        if (!TYPES_NOTIF.includes(type)) {
            return res.status(400).json({ message: 'Type de notification invalide.' });
        }
        if (!['app', 'sms', 'email'].includes(canal)) {
            return res.status(400).json({ message: 'Canal invalide.' });
        }
        if (!['immediat', 'quotidien', 'hebdo'].includes(frequence)) {
            return res.status(400).json({ message: 'Fréquence invalide.' });
        }

        // Mettre à jour ou créer
        const [pref] = await PreferenceNotification.findOrCreate({
            where: { utilisateur_id, type },
            defaults: { enabled, canal, frequence }
        });

        await pref.update({ enabled, canal, frequence });

        res.json({
            message: 'Préférence mise à jour.',
            preference: pref
        });
    } catch (erreur) {
        console.error('Erreur update pref :', erreur);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// NI-05 : Réinitialiser toutes les préférences aux defaults
const resetPreferences = async (req, res) => {
    try {
        const utilisateur_id = req.utilisateur.id;

        await PreferenceNotification.destroy({
            where: { utilisateur_id }
        });

        const prefsDefault = await Promise.all(
            TYPES_NOTIF.map(type =>
                PreferenceNotification.create({
                    utilisateur_id,
                    type,
                    enabled: true,
                    canal: type === 'systeme' ? 'app' : 'app',
                    frequence: type === 'commande' || type === 'message' ? 'immediat' : 'quotidien'
                })
            )
        );

        res.json({
            message: 'Préférences réinitialisées.',
            preferences: prefsDefault
        });
    } catch (erreur) {
        console.error('Erreur reset prefs :', erreur);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// Vérifier si une notification doit être envoyée selon les préférences
const shouldNotify = async (utilisateur_id, type) => {
    try {
        const pref = await PreferenceNotification.findOne({
            where: { utilisateur_id, type }
        });
        
        if (!pref) return true; // Default: envoyer si pas de préférence
        return pref.enabled;
    } catch (e) {
        console.error('Erreur shouldNotify :', e);
        return true; // Default: envoyer en cas d'erreur
    }
};

module.exports = {
    getPreferences,
    updatePreference,
    resetPreferences,
    shouldNotify
};
