// ========================================
// CONTRÔLEUR : GESTION DES STOCKS
// ========================================
// Module 4 — GS-01 à GS-07

const { Produit, Notification } = require('../models');
const { Op } = require('sequelize');

// GS-02 : Consulter les stocks en temps réel (pêcheur)
const mesStocks = async (req, res) => {
  try {
    const produits = await Produit.findAll({
      where: { pecheur_id: req.utilisateur.id },
      attributes: ['id', 'type_poisson', 'poids_kg', 'prix_unitaire', 'date_capture', 'etat', 'statut', 'seuil_alerte', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    // Calculer les statistiques
    const stats = {
      total_produits: produits.length,
      poids_total: 0,
      valeur_totale: 0,
      en_alerte: 0,
      vendus: 0
    };

    produits.forEach(p => {
      if (p.statut === 'disponible') {
        stats.poids_total += parseFloat(p.poids_kg);
        stats.valeur_totale += Math.round(p.poids_kg * p.prix_unitaire);
        if (parseFloat(p.poids_kg) <= (parseFloat(p.seuil_alerte) || 5)) {
          stats.en_alerte++;
        }
      } else if (p.statut === 'vendu') {
        stats.vendus++;
      }
    });

    res.json({
      produits,
      statistiques: stats
    });
  } catch (erreur) {
    console.error('Erreur stocks :', erreur);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GS-03 : Paramétrer le seuil d'alerte
const changerSeuilAlerte = async (req, res) => {
  try {
    const { produit_id, seuil_kg } = req.body;

    const produit = await Produit.findByPk(produit_id);
    if (!produit || produit.pecheur_id !== req.utilisateur.id) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }

    await produit.update({ seuil_alerte: seuil_kg });

    res.json({
      message: `Seuil d'alerte fixé à ${seuil_kg}kg.`,
      produit
    });
  } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GS-05 : Mettre à jour manuellement les quantités (vente hors plateforme)
const mettreAJourStock = async (req, res) => {
  try {
    const { produit_id, nouvelle_quantite } = req.body;

    const produit = await Produit.findByPk(produit_id);
    if (!produit || produit.pecheur_id !== req.utilisateur.id) {
      return res.status(403).json({ message: 'Non autorisé.' });
    }

    const ancienne = parseFloat(produit.poids_kg);
    await produit.update({
      poids_kg: nouvelle_quantite,
      statut: nouvelle_quantite <= 0 ? 'vendu' : 'disponible'
    });

    // Créer une notification
    await Notification.create({
      utilisateur_id: req.utilisateur.id,
      type: 'stock',
      titre: 'Stock modifié',
      contenu: `${produit.type_poisson} : ${ancienne}kg → ${nouvelle_quantite}kg`
    });

    res.json({
      message: 'Stock mis à jour.',
      produit
    });
  } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GS-06 : Rapport hebdomadaire de stock
const rapportHebdo = async (req, res) => {
  try {
    const ilYa7jours = new Date();
    ilYa7jours.setDate(ilYa7jours.getDate() - 7);

    const produits = await Produit.findAll({
      where: { pecheur_id: req.utilisateur.id },
      attributes: ['type_poisson', 'poids_kg', 'prix_unitaire', 'statut', 'createdAt']
    });

    const rapport = {
      semaine_du: new Date(ilYa7jours),
      total_produits_publies: produits.length,
      vendus: produits.filter(p => p.statut === 'vendu').length,
      disponibles: produits.filter(p => p.statut === 'disponible').length,
      poids_total: produits.reduce((sum, p) => sum + parseFloat(p.poids_kg), 0),
      valeur_totale: produits.reduce((sum, p) => sum + (parseFloat(p.poids_kg) * p.prix_unitaire), 0)
    };

    res.json(rapport);
  } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

// GS-07 : Vue consolidée des stocks (admin)
const stocksGlobaux = async (req, res) => {
  try {
    const produits = await Produit.findAll({
      attributes: ['id', 'type_poisson', 'poids_kg', 'prix_unitaire', 'statut', 'pecheur_id'],
      include: [{ model: require('../models').Utilisateur, as: 'pecheur', attributes: ['nom', 'localisation'] }]
    });

    const stats = {
      poids_total_disponible: 0,
      valeur_totale_stock: 0,
      produits_en_alerte: 0,
      par_region: {}
    };

    produits.forEach(p => {
      if (p.statut === 'disponible') {
        stats.poids_total_disponible += parseFloat(p.poids_kg);
        stats.valeur_totale_stock += Math.round(parseFloat(p.poids_kg) * p.prix_unitaire);

        if (parseFloat(p.poids_kg) <= (parseFloat(p.seuil_alerte) || 5)) {
          stats.produits_en_alerte++;
        }
      }

      const region = p.pecheur?.localisation.split(',')[0].trim() || 'Inconnu';
      if (!stats.par_region[region]) {
        stats.par_region[region] = { poids: 0, valeur: 0, produits: 0 };
      }
      stats.par_region[region].poids += parseFloat(p.poids_kg);
      stats.par_region[region].valeur += Math.round(parseFloat(p.poids_kg) * p.prix_unitaire);
      stats.par_region[region].produits++;
    });

    res.json({
      statistiques: stats,
      produits
    });
  } catch (erreur) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
};

module.exports = {
  mesStocks,
  changerSeuilAlerte,
  mettreAJourStock,
  rapportHebdo,
  stocksGlobaux
};
