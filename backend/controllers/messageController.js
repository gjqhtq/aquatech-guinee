// ========================================
// CONTRÔLEUR : MESSAGERIE
// ========================================
// Module 5 — SM-01 à SM-06

const { Message, Utilisateur } = require('../models');
const { Op } = require('sequelize');

// SM-01 : Envoyer un message
const envoyerMessage = async (req, res) => {
    try {
        const { destinataire_id, contenu } = req.body;

        const destinataire = await Utilisateur.findByPk(destinataire_id);
        if (!destinataire) {
        return res.status(404).json({ message: 'Destinataire introuvable.' });
        }

        const message = await Message.create({
        expediteur_id: req.utilisateur.id,
        destinataire_id,
        contenu
        });

        res.status(201).json({ message: 'Message envoyé.', data: message });
    } catch (erreur) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
    };

    // SM-02 : Historique des conversations
    const getConversations = async (req, res) => {
    try {
        const userId = req.utilisateur.id;

        // Trouver les derniers messages avec chaque contact
        const messages = await Message.findAll({
        where: {
            [Op.or]: [
            { expediteur_id: userId },
            { destinataire_id: userId }
            ]
        },
        include: [
            { model: Utilisateur, as: 'expediteur', attributes: ['id', 'nom'] },
            { model: Utilisateur, as: 'destinataire', attributes: ['id', 'nom'] }
        ],
        order: [['createdAt', 'DESC']]
        });

        // Grouper par contact
        const conversationsMap = {};
        messages.forEach((msg) => {
        const contactId = msg.expediteur_id === userId ? msg.destinataire_id : msg.expediteur_id;
        if (!conversationsMap[contactId]) {
            const contact = msg.expediteur_id === userId ? msg.destinataire : msg.expediteur;
            conversationsMap[contactId] = {
            contact_id: contactId,
            contact_nom: contact.nom,
            dernier_message: msg.contenu,
            date: msg.createdAt,
            non_lu: msg.destinataire_id === userId && !msg.lu ? 1 : 0
            };
        }
        });

        res.json({ conversations: Object.values(conversationsMap) });
    } catch (erreur) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
    };

    // Messages avec un contact spécifique
    const getMessagesAvec = async (req, res) => {
    try {
        const { contactId } = req.params;
        const userId = req.utilisateur.id;

        const messages = await Message.findAll({
        where: {
            [Op.or]: [
            { expediteur_id: userId, destinataire_id: contactId },
            { expediteur_id: contactId, destinataire_id: userId }
            ]
        },
        include: [
            { model: Utilisateur, as: 'expediteur', attributes: ['id', 'nom'] }
        ],
        order: [['createdAt', 'ASC']]
        });

        // Marquer comme lus (SM-04)
        await Message.update(
        { lu: true },
        { where: { expediteur_id: contactId, destinataire_id: userId, lu: false } }
        );

        res.json({ messages });
    } catch (erreur) {
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

module.exports = { envoyerMessage, getConversations, getMessagesAvec };
