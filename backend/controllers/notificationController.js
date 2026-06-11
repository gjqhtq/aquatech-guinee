// ========================================
// CONTRÔLEUR : NOTIFICATIONS
// ========================================
// Module 6 — NI-01 à NI-06

const { Notification } = require('../models');

// Lister les notifications de l'utilisateur connecté
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll({
        where: { utilisateur_id: req.utilisateur.id },
        order: [['createdAt', 'DESC']],
        limit: 50
        });

        const nonLues = await Notification.count({
        where: { utilisateur_id: req.utilisateur.id, lu: false }
        });

        res.json({ notifications, non_lues: nonLues });
    } catch (erreur) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
    };

    // Marquer une notification comme lue
    const marquerLue = async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (!notification || notification.utilisateur_id !== req.utilisateur.id) {
        return res.status(403).json({ message: 'Non autorisé.' });
        }
        await notification.update({ lu: true });
        res.json({ message: 'Notification lue.' });
    } catch (erreur) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
    };

    // Marquer toutes comme lues
    const marquerToutesLues = async (req, res) => {
    try {
        await Notification.update(
        { lu: true },
        { where: { utilisateur_id: req.utilisateur.id, lu: false } }
        );
        res.json({ message: 'Toutes les notifications marquées comme lues.' });
    } catch (erreur) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

module.exports = { getNotifications, marquerLue, marquerToutesLues };
