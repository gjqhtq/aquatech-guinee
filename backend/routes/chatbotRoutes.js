const express = require('express');
const router = express.Router();

// Base de règles FAQ (miroir de chatbotData.js côté frontend)
const faq = [
  { mots: ['inscription', 'inscrire', 'compte'], reponse: "Pour vous inscrire, cliquez sur S'inscrire, renseignez vos informations et validez votre numéro par OTP SMS." },
  { mots: ['connexion', 'connecter', 'mot de passe'], reponse: "Connectez-vous avec votre numéro de téléphone et mot de passe. En cas d'oubli, utilisez la récupération par OTP SMS." },
  { mots: ['commande', 'commander', 'acheter'], reponse: "Allez dans le Catalogue, sélectionnez un produit, choisissez la quantité et confirmez. Le pêcheur a 2h pour accepter." },
  { mots: ['statut', 'suivi', 'livraison'], reponse: "Consultez vos commandes dans la section Commandes. Statuts : En attente → Confirmée → En préparation → En livraison → Livrée." },
  { mots: ['produit', 'poisson', 'vendre', 'stock'], reponse: "En tant que pêcheur, allez dans Mes Produits pour ajouter : type, poids, prix, date de capture, état et photos." },
  { mots: ['aide', 'support', 'probleme'], reponse: "Contactez l'équipe AquaTech via la Messagerie en décrivant votre problème." }
];

const normaliser = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

router.post('/', (req, res) => {
  const { question } = req.body;
  if (!question || typeof question !== 'string') {
    return res.status(400).json({ erreur: 'Question manquante' });
  }
  const q = normaliser(question);
  for (const item of faq) {
    if (item.mots.some(m => q.includes(normaliser(m)))) {
      return res.json({ reponse: item.reponse });
    }
  }
  res.json({ reponse: "Je n'ai pas compris. Essayez des mots-clés : commande, inscription, produit, livraison, aide." });
});

module.exports = router;
