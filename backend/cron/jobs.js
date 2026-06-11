const cron = require('node-cron');
const { Commande, Produit, Notification } = require('../models');
const { Op } = require('sequelize');

// GC-03 : Annulation automatique des commandes en attente depuis plus de 2h
const annulationAuto = cron.schedule('*/10 * * * *', async () => {
    try {
        const limite = new Date(Date.now() - 2 * 60 * 60 * 1000);
        const commandes = await Commande.findAll({
            where: {
                statut: 'en_attente',
                createdAt: { [Op.lt]: limite }
            }
        });

        for (const c of commandes) {
            await c.update({ statut: 'annulee' });
            await Notification.create({
                utilisateur_id: c.acheteur_id,
                type: 'commande',
                titre: 'Commande annulée automatiquement',
                contenu: 'Votre commande a été annulée car le pêcheur n\'a pas répondu dans les 2 heures.'
            });
            await Notification.create({
                utilisateur_id: c.pecheur_id,
                type: 'commande',
                titre: 'Commande expirée',
                contenu: 'Une commande a été annulée automatiquement faute de réponse dans les 2 heures.'
            });
        }

        if (commandes.length > 0) {
            console.log(`[CRON] ${commandes.length} commande(s) annulée(s) automatiquement.`);
        }
    } catch (e) {
        console.error('[CRON] Erreur annulation auto :', e.message);
    }
});

// GP-07 : Alerte produit non vendu depuis 48h
const alerteProduitNonVendu = cron.schedule('0 8 * * *', async () => {
    try {
        const limite = new Date(Date.now() - 48 * 60 * 60 * 1000);
        const produits = await Produit.findAll({
            where: {
                statut: 'disponible',
                createdAt: { [Op.lt]: limite }
            }
        });

        for (const p of produits) {
            const dejaNotifie = await Notification.findOne({
                where: {
                    utilisateur_id: p.pecheur_id,
                    type: 'stock',
                    contenu: { [Op.like]: `%${p.id}%` }
                }
            });
            if (!dejaNotifie) {
                await Notification.create({
                    utilisateur_id: p.pecheur_id,
                    type: 'stock',
                    titre: 'Produit non vendu depuis 48h',
                    contenu: `Votre produit "${p.type_poisson}" (${p.poids_kg} kg) n'a pas été vendu depuis 48h. Pensez à ajuster le prix. ID:${p.id}`
                });
            }
        }

        if (produits.length > 0) {
            console.log(`[CRON] ${produits.length} alerte(s) produit non vendu envoyée(s).`);
        }
    } catch (e) {
        console.error('[CRON] Erreur alerte produit :', e.message);
    }
});

// GS-03 : Alerte stock bas — vérification toutes les heures
const alerteStockBas = cron.schedule('0 * * * *', async () => {
    try {
        const produits = await Produit.findAll({
            where: {
                statut: 'disponible',
                seuil_alerte: { [Op.not]: null }
            }
        });

        for (const p of produits) {
            if (parseFloat(p.poids_kg) <= parseFloat(p.seuil_alerte)) {
                const dejaNotifie = await Notification.findOne({
                    where: {
                        utilisateur_id: p.pecheur_id,
                        type: 'stock',
                        titre: 'Stock bas',
                        createdAt: { [Op.gt]: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                    }
                });
                if (!dejaNotifie) {
                    await Notification.create({
                        utilisateur_id: p.pecheur_id,
                        type: 'stock',
                        titre: 'Stock bas',
                        contenu: `Le stock de "${p.type_poisson}" est bas : ${p.poids_kg} kg restants (seuil : ${p.seuil_alerte} kg).`
                    });
                }
            }
        }
    } catch (e) {
        console.error('[CRON] Erreur alerte stock bas :', e.message);
    }
});

module.exports = { annulationAuto, alerteProduitNonVendu, alerteStockBas };
