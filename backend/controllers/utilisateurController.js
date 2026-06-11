// ========================================
// CONTRÔLEUR : UTILISATEURS
// ========================================
// Contient toute la logique métier pour la gestion des utilisateurs
// Couvre les exigences : GU-01 à GU-08

const { Utilisateur } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const normaliserTelephone = (tel) => (tel || '').replace(/\D/g, '');

// ----------------------------------------
// INSCRIPTION (GU-01 + GU-02)
// ----------------------------------------
const inscrire = async (req, res) => {
    try {
    // Vérifier les erreurs de validation
    const erreurs = validationResult(req);
    if (!erreurs.isEmpty()) {
        return res.status(400).json({ erreurs: erreurs.array() });
    }

    const { nom, localisation, role, mot_de_passe } = req.body;
    const telephone = normaliserTelephone(req.body.telephone);

    if (!telephone) {
        return res.status(400).json({ message: 'Numéro de téléphone invalide.' });
    }

    // Vérifier si le téléphone est déjà utilisé
    const existant = await Utilisateur.findOne({ where: { telephone } });
    if (existant) {
        return res.status(400).json({
            message: 'Ce numéro de téléphone est déjà associé à un compte.'
        });
    }

    // Hacher le mot de passe (12 rounds de sécurité)
    const motDePasseHash = await bcrypt.hash(mot_de_passe, 12);

    // Créer l'utilisateur dans la base de données
    const utilisateur = await Utilisateur.create({
        nom,
        telephone,
        localisation,
        role: role || 'acheteur',
        mot_de_passe: motDePasseHash,
        otp_code: null,
        otp_expiration: null,
        telephone_verifie: true
    });

    res.status(201).json({
        message: 'Compte créé avec succès. Vous pouvez vous connecter.',
        utilisateur: {
            id: utilisateur.id,
            nom: utilisateur.nom,
            telephone: utilisateur.telephone,
            role: utilisateur.role
        }
    });

    } catch (erreur) {
        console.error('Erreur inscription :', erreur);
        res.status(500).json({ message: 'Erreur serveur lors de l\'inscription.' });
    }
};

// ----------------------------------------
// VÉRIFICATION OTP (GU-02)
// ----------------------------------------
const verifierOTP = async (req, res) => {
    try {
        const telephone = normaliserTelephone(req.body.telephone);
        const { otp } = req.body;

        const utilisateur = await Utilisateur.findOne({ where: { telephone } });
        if (!utilisateur) {
            return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    if (utilisateur.otp_code !== otp) {
        return res.status(400).json({ message: 'Code OTP incorrect.' });
    }

    if (new Date() > utilisateur.otp_expiration) {
        return res.status(400).json({ message: 'Code OTP expiré.' });
    }

    // Marquer le téléphone comme vérifié
    await utilisateur.update({
        telephone_verifie: true,
        otp_code: null,
        otp_expiration: null
    });

    res.json({ message: 'Téléphone vérifié avec succès. Vous pouvez vous connecter.' });

    } catch (erreur) {
        console.error('Erreur vérification OTP :', erreur);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// ----------------------------------------
// CONNEXION (GU-03)
// ----------------------------------------
// Authentification par téléphone + mot de passe
// Blocage après 5 tentatives échouées (protection force brute)
const connecter = async (req, res) => {
    try {
    const telephone = normaliserTelephone(req.body.telephone);
    const { mot_de_passe } = req.body;

    const utilisateur = await Utilisateur.findOne({ where: { telephone } });
    if (!utilisateur) {
        return res.status(401).json({ message: 'Numéro de téléphone ou mot de passe incorrect.' });
    }

    // Vérifier si le compte est bloqué (GU-03)
    if (utilisateur.compte_bloque) {
        return res.status(403).json({
            message: 'Compte bloqué suite à trop de tentatives. Contactez le support.'
        });
    }

    if (utilisateur.statut !== 'actif') {
        return res.status(403).json({ message: 'Votre compte a été suspendu.' });
    }

    // Comparer le mot de passe avec le hash en base
    const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
    if (!motDePasseValide) {
        const nouvellesTentatives = utilisateur.tentatives_connexion + 1;
        const bloquer = nouvellesTentatives >= 5;

        await utilisateur.update({
            tentatives_connexion: nouvellesTentatives,
            compte_bloque: bloquer
        });

        if (bloquer) {
        return res.status(403).json({
            message: 'Compte bloqué après 5 tentatives échouées.'
        });
        }

        return res.status(401).json({
        message: `Mot de passe incorrect. Tentative ${nouvellesTentatives}/5.`
        });
    }

    // Réinitialiser le compteur après connexion réussie
    await utilisateur.update({ tentatives_connexion: 0 });

    // Générer le token JWT
    const token = jwt.sign(
        { id: utilisateur.id, role: utilisateur.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
        message: 'Connexion réussie.',
        token,
        utilisateur: {
            id: utilisateur.id,
            nom: utilisateur.nom,
            telephone: utilisateur.telephone,
            role: utilisateur.role,
            localisation: utilisateur.localisation
        }
    });

    } catch (erreur) {
    console.error('Erreur connexion :', erreur);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion.' });
    }
};

// ----------------------------------------
// PROFIL - Consulter (GU-05)
// ----------------------------------------
const getProfil = async (req, res) => {
    try {
    const u = req.utilisateur;
    res.json({
        id: u.id,
        nom: u.nom,
        telephone: u.telephone,
        localisation: u.localisation,
        role: u.role,
        photo: u.photo,
        description: u.description,
        statut: u.statut,
        date_inscription: u.createdAt
    });
    } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// ----------------------------------------
// PROFIL - Modifier (GU-05)
// ----------------------------------------
const modifierProfil = async (req, res) => {
    try {
    const u = req.utilisateur;
    const { nom, localisation, description } = req.body;
    const telephone = req.body.telephone ? normaliserTelephone(req.body.telephone) : u.telephone;

    await u.update({
        nom: nom || u.nom,
        telephone,
        localisation: localisation || u.localisation,
        description: description || u.description
    });

    res.json({
        message: 'Profil mis à jour avec succès.',
        utilisateur: {
        id: u.id,
        nom: u.nom,
        telephone: u.telephone,
        localisation: u.localisation,
        description: u.description
        }
    });
    } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// ----------------------------------------
// ADMIN - Lister tous les utilisateurs (GU-06)
// ----------------------------------------
const listerUtilisateurs = async (req, res) => {
    try {
        const utilisateurs = await Utilisateur.findAll({
        attributes: { exclude: ['mot_de_passe', 'otp_code', 'otp_expiration'] }
    });
    res.json({ utilisateurs });
    } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// ----------------------------------------
// ADMIN - Activer/Suspendre/Supprimer (GU-06)
// ----------------------------------------
const changerStatut = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;

        const utilisateur = await Utilisateur.findByPk(id);
    if (!utilisateur) {
        return res.status(404).json({ message: 'Utilisateur introuvable.' });
    }

    await utilisateur.update({ statut });

    res.json({
        message: `Compte ${statut} avec succès.`,
        utilisateur: { id: utilisateur.id, nom: utilisateur.nom, statut }
    });
    } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// TB-01 à TB-03 : Statistiques du pêcheur pour son tableau de bord
const getStatsPecheur = async (req, res) => {
    try {
        const { Produit, Commande, Notification } = require('../models');
        const { Op, fn, col } = require('sequelize');

        const pecheur_id = req.utilisateur.id;

        // Commandes reçues
        const commandes = await Commande.findAll({
            where: { pecheur_id },
            attributes: ['id', 'prix_total', 'statut', 'evaluation_note', 'createdAt']
        });

        // Chiffre d'affaires
        const ca_total = commandes
            .filter(c => c.statut === 'livree')
            .reduce((sum, c) => sum + c.prix_total, 0);

        const ca_jour = commandes
            .filter(c => c.statut === 'livree' && new Date(c.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000))
            .reduce((sum, c) => sum + c.prix_total, 0);

        const ca_semaine = commandes
            .filter(c => c.statut === 'livree' && new Date(c.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
            .reduce((sum, c) => sum + c.prix_total, 0);

        // Produits
        const produits = await Produit.findAll({
            where: { pecheur_id },
            attributes: ['statut']
        });

        // Note moyenne de réputation (TB-03)
        const noteMoyenne = commandes.length > 0
            ? (commandes.filter(c => c.evaluation_note).reduce((sum, c) => sum + c.evaluation_note, 0) / commandes.filter(c => c.evaluation_note).length)
            : 0;

        // Commandes par statut
        const parStatut = {
            en_attente: commandes.filter(c => c.statut === 'en_attente').length,
            confirmee: commandes.filter(c => c.statut === 'confirmee').length,
            en_preparation: commandes.filter(c => c.statut === 'en_preparation').length,
            en_livraison: commandes.filter(c => c.statut === 'en_livraison').length,
            livree: commandes.filter(c => c.statut === 'livree').length,
            annulee: commandes.filter(c => c.statut === 'annulee').length
        };

        res.json({
            chiffre_affaires: {
                total: ca_total,
                jour: ca_jour,
                semaine: ca_semaine
            },
            commandes: {
                total: commandes.length,
                par_statut: parStatut
            },
            produits: {
                publies: produits.length,
                disponibles: produits.filter(p => p.statut === 'disponible').length,
                vendus: produits.filter(p => p.statut === 'vendu').length
            },
            reputation: {
                note_moyenne: noteMoyenne.toFixed(1),
                total_evaluations: commandes.filter(c => c.evaluation_note).length
            }
        });
    } catch (erreur) {
        console.error('Erreur stats pecheur :', erreur);
        res.status(500).json({ message: 'Erreur serveur.' });
    }
};

module.exports = {
    inscrire,
    verifierOTP,
    connecter,
    getProfil,
    modifierProfil,
    listerUtilisateurs,
    changerStatut,
    getStatsPecheur
};
