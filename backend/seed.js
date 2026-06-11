// ========================================
// SEED : Données de démonstration AquaTech Guinée
// ========================================
// node seed.js              → met à jour les photos du catalogue (sans toucher aux utilisateurs)
// node seed.js --reset      → EFFACE TOUT et recrée les données de démo

require('dotenv').config();
const { sequelize } = require('./config/database');
const { Utilisateur, Produit, Commande, Notification } = require('./models');
const bcrypt = require('bcryptjs');

const RESET = process.argv.includes('--reset') || process.argv.includes('--force');

const IMAGE_BY_TYPE = {
    'Thiof (Mérou blanc)':   '/images/thiof-merou-blanc.png',
    'Vivaneau rouge':        '/images/vivaneau-rouge.png',
    'Bar commun':            '/images/bar-commun.png',
    'Dorade royale':         '/images/dorade-royale.png',
    'Capitaine (Carangue)':  '/images/capitaine-carangue.png',
    'Sole':                  '/images/sole.png',
    'Thon albacore':         '/images/thon-albacore.png',
    'Thon listao':           '/images/thon-listao.png',
    'Bonite à dos rayé':     '/images/bonite-dos-raye.png',
    'Espadon':               '/images/espadon.png',
    'Sardines fraîches':     '/images/sardines-fraiches.png',
    'Hareng':                '/images/hareng.png',
    'Maquereau':             '/images/maquereau.png',
    'Anchois':               '/images/anchois.png',
    'Crevettes royales':     '/images/crevettes-royales.png',
    'Crevettes grises':      '/images/crevettes-grises.png',
    'Homard':                '/images/homard.png',
    'Crabe de mer':          '/images/crabe-de-mer.png',
    'Langouste':             '/images/langouste.png',
    'Poulpe':                '/images/poulpe.png',
    'Poulpe séché':          '/images/poulpe-seche.png',
    'Calmars':               '/images/calmars.png',
    'Huîtres de palétuvier': '/images/huitres-paletuvier.png',
    'Rouget barbet':         '/images/rouget-barbet.png',
    'Pageot':                '/images/pageot.png',
    'Mulet':                 '/images/mulet.png',
    'Carpe de mer':          '/images/carpe-de-mer.png',
    'Thiof séché':           '/images/thiof-seche.png',
    'Capitaine fumé':        '/images/capitaine-fume.png',
    'Sardines séchées':      '/images/sardines-sechees.png',
    'Thon albacore congelé': '/images/thon-albacore-congele.png',
    'Crevettes congelées':   '/images/crevettes-congelees.png',
};

const mettreAJourPhotos = async () => {
    let misAJour = 0;
    for (const [type, src] of Object.entries(IMAGE_BY_TYPE)) {
        const [nb] = await Produit.update(
            { photos: [src] },
            { where: { type_poisson: type } }
        );
        misAJour += nb;
    }
    return misAJour;
};

const seedComplet = async () => {
    console.warn('\n⚠️  RESET : toutes les données vont être effacées (utilisateurs inclus).');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true });
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('Tables recrées.');

    const hash  = await bcrypt.hash('admin123', 12);
    const hashP = await bcrypt.hash('pecheur123', 12);
    const hashA = await bcrypt.hash('acheteur123', 12);
    const hashR = await bcrypt.hash('resto123', 12);
    const hashL = await bcrypt.hash('livreur123', 12);

    await Utilisateur.create({
        nom: 'Admin AquaTech', telephone: '620000000',
        localisation: 'Conakry, Kaloum', role: 'admin',
        mot_de_passe: hash, telephone_verifie: true, statut: 'actif'
    });

    const pecheurs = await Utilisateur.bulkCreate([
        { nom: 'Mamadou Diallo',    telephone: '620111111', localisation: 'Conakry, Boulbinet',   role: 'pecheur', mot_de_passe: hashP, telephone_verifie: true, statut: 'actif' },
        { nom: 'Ibrahim Camara',    telephone: '620222222', localisation: 'Boké, Kamsar',          role: 'pecheur', mot_de_passe: hashP, telephone_verifie: true, statut: 'actif' },
        { nom: 'Ousmane Bah',       telephone: '620333333', localisation: 'Benty, Forecariah',     role: 'pecheur', mot_de_passe: hashP, telephone_verifie: true, statut: 'actif' },
        { nom: 'Sékou Kouyaté',     telephone: '620777777', localisation: 'Conakry, Matam',        role: 'pecheur', mot_de_passe: hashP, telephone_verifie: true, statut: 'actif' },
        { nom: 'Aliou Baldé',       telephone: '620888888', localisation: 'Coyah, Wonkifong',      role: 'pecheur', mot_de_passe: hashP, telephone_verifie: true, statut: 'actif' },
        { nom: 'Mamadou Kourouma',  telephone: '620999999', localisation: 'Dubréka, Tanènè',       role: 'pecheur', mot_de_passe: hashP, telephone_verifie: true, statut: 'actif' },
    ]);

    const acheteurs = await Utilisateur.bulkCreate([
        { nom: 'Fatoumata Soumah',  telephone: '620444444', localisation: 'Conakry, Ratoma',   role: 'acheteur', mot_de_passe: hashA, telephone_verifie: true, statut: 'actif' },
        { nom: 'Alpha Barry',       telephone: '620555555', localisation: 'Conakry, Kaloum',   role: 'acheteur', mot_de_passe: hashA, telephone_verifie: true, statut: 'actif' },
        { nom: 'Mariama Diallo',    telephone: '621100001', localisation: 'Conakry, Dixinn',   role: 'acheteur', mot_de_passe: hashA, telephone_verifie: true, statut: 'actif' },
        { nom: 'Ibrahima Sow',      telephone: '621100002', localisation: 'Conakry, Matoto',   role: 'acheteur', mot_de_passe: hashA, telephone_verifie: true, statut: 'actif' },
    ]);

    const restos = await Utilisateur.bulkCreate([
        { nom: 'Restaurant Le Palmier',     telephone: '620666666', localisation: 'Conakry, Kipé',      role: 'restaurant', mot_de_passe: hashR, telephone_verifie: true, statut: 'actif' },
        { nom: 'Hotel Camayenne',           telephone: '621200001', localisation: 'Conakry, Kaloum',    role: 'restaurant', mot_de_passe: hashR, telephone_verifie: true, statut: 'actif' },
        { nom: 'Brasserie du Port',         telephone: '621200002', localisation: 'Conakry, Boulbinet', role: 'restaurant', mot_de_passe: hashR, telephone_verifie: true, statut: 'actif' },
        { nom: 'Restaurant Noom Hotel',     telephone: '621200003', localisation: 'Conakry, Kaloum',    role: 'restaurant', mot_de_passe: hashR, telephone_verifie: true, statut: 'actif' },
    ]);

    await Utilisateur.bulkCreate([
        { nom: 'Cellou Traoré',  telephone: '621300001', localisation: 'Conakry, Ratoma',  role: 'livreur',      mot_de_passe: hashL, telephone_verifie: true, statut: 'actif' },
        { nom: 'Aboubacar Sylla',telephone: '621300002', localisation: 'Conakry, Matoto',  role: 'distributeur', mot_de_passe: hashL, telephone_verifie: true, statut: 'actif' },
    ]);

    const today = new Date().toISOString().split('T')[0];
    const hier  = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const withPhoto = (p) => {
        const src = IMAGE_BY_TYPE[p.type_poisson];
        return src ? { ...p, photos: [src] } : p;
    };

    const produits = await Produit.bulkCreate([
        { type_poisson: 'Thiof (Mérou blanc)',      categorie: 'Poisson noble',   poids_kg: 30,  prix_unitaire: 55000, date_capture: today, lieu_capture: 'Conakry, Boulbinet',   etat: 'frais',   pecheur_id: pecheurs[0].id, statut: 'disponible', description: 'Roi des poissons de la côte guinéenne. Chair blanche, ferme et savoureuse. Idéal pour le thiéboudienne et les grillades de restaurant.' },
        { type_poisson: 'Vivaneau rouge',           categorie: 'Poisson noble',   poids_kg: 22,  prix_unitaire: 48000, date_capture: today, lieu_capture: 'Boké, Kamsar',          etat: 'frais',   pecheur_id: pecheurs[1].id, statut: 'disponible', description: 'Poisson de fond à chair fine et délicate. Très apprécié dans les restaurants haut de gamme.' },
        { type_poisson: 'Bar commun',               categorie: 'Poisson noble',   poids_kg: 18,  prix_unitaire: 42000, date_capture: today, lieu_capture: 'Benty, Forecariah',     etat: 'frais',   pecheur_id: pecheurs[2].id, statut: 'disponible', description: 'Bar sauvage de l\'Atlantique. Chair blanche et ferme, peu arêtes. Parfait en filet ou entier au four.' },
        { type_poisson: 'Dorade royale',            categorie: 'Poisson noble',   poids_kg: 15,  prix_unitaire: 45000, date_capture: today, lieu_capture: 'Conakry, Matam',        etat: 'frais',   pecheur_id: pecheurs[3].id, statut: 'disponible', description: 'Dorade sauvage de l\'Atlantique. Goût prononcé, chair ferme. Très demandée par les restaurants et hôtels.' },
        { type_poisson: 'Capitaine (Carangue)',     categorie: 'Poisson noble',   poids_kg: 25,  prix_unitaire: 38000, date_capture: today, lieu_capture: 'Conakry, Boulbinet',   etat: 'frais',   pecheur_id: pecheurs[0].id, statut: 'disponible', description: 'Poisson emblématique de la cuisine guinéenne. Chair savoureuse, idéal pour la sauce feuille et les grillades.' },
        { type_poisson: 'Sole',                     categorie: 'Poisson noble',   poids_kg: 12,  prix_unitaire: 50000, date_capture: today, lieu_capture: 'Boké, Kamsar',          etat: 'frais',   pecheur_id: pecheurs[1].id, statut: 'disponible', description: 'Poisson plat à chair très fine. Produit premium très recherché par les restaurants gastronomiques.' },
        { type_poisson: 'Thon albacore',            categorie: 'Thon',            poids_kg: 45,  prix_unitaire: 32000, date_capture: today, lieu_capture: 'Conakry, Boulbinet',   etat: 'frais',   pecheur_id: pecheurs[0].id, statut: 'disponible', description: 'Thon de haute mer, chair rouge ferme. Idéal pour les sashimis, grillades et conserves artisanales.' },
        { type_poisson: 'Thon listao',              categorie: 'Thon',            poids_kg: 60,  prix_unitaire: 22000, date_capture: today, lieu_capture: 'Benty, Forecariah',     etat: 'frais',   pecheur_id: pecheurs[2].id, statut: 'disponible', description: 'Thon rayé très abondant dans les eaux guinéennes. Excellent rapport qualité-prix pour les restaurants.' },
        { type_poisson: 'Bonite à dos rayé',        categorie: 'Thon',            poids_kg: 35,  prix_unitaire: 18000, date_capture: hier,  lieu_capture: 'Conakry, Matam',        etat: 'frais',   pecheur_id: pecheurs[3].id, statut: 'disponible', description: 'Proche du thon, chair ferme et goûteuse. Très utilisée dans la cuisine locale et les restaurants.' },
        { type_poisson: 'Espadon',                  categorie: 'Thon',            poids_kg: 20,  prix_unitaire: 60000, date_capture: today, lieu_capture: 'Boké, Kamsar',          etat: 'frais',   pecheur_id: pecheurs[1].id, statut: 'disponible', description: 'Poisson de haute mer rare et prisé. Chair dense et savoureuse, idéale pour les steaks de poisson.' },
        { type_poisson: 'Sardines fraîches',        categorie: 'Petits poissons', poids_kg: 80,  prix_unitaire: 12000, date_capture: today, lieu_capture: 'Conakry, Boulbinet',   etat: 'frais',   pecheur_id: pecheurs[0].id, statut: 'disponible', description: 'Sardines de saison, très fraîches. Idéales pour la friture, la grillade ou la sauce tomate.' },
        { type_poisson: 'Hareng',                   categorie: 'Petits poissons', poids_kg: 50,  prix_unitaire: 10000, date_capture: today, lieu_capture: 'Benty, Forecariah',     etat: 'frais',   pecheur_id: pecheurs[2].id, statut: 'disponible', description: 'Petit poisson gras très nutritif. Excellent fumé ou grillé, très populaire dans les ménages.' },
        { type_poisson: 'Maquereau',                categorie: 'Petits poissons', poids_kg: 40,  prix_unitaire: 14000, date_capture: today, lieu_capture: 'Conakry, Matam',        etat: 'frais',   pecheur_id: pecheurs[3].id, statut: 'disponible', description: 'Poisson gras riche en oméga-3. Chair savoureuse, idéal grillé ou en marinade.' },
        { type_poisson: 'Anchois',                  categorie: 'Petits poissons', poids_kg: 30,  prix_unitaire: 8000,  date_capture: today, lieu_capture: 'Coyah, Wonkifong',      etat: 'frais',   pecheur_id: pecheurs[4].id, statut: 'disponible', description: 'Petit poisson très savoureux. Utilisé frais ou séché comme condiment dans de nombreux plats.' },
        { type_poisson: 'Crevettes royales',        categorie: 'Crustaces',       poids_kg: 8,   prix_unitaire: 75000, date_capture: today, lieu_capture: 'Boké, Kamsar',          etat: 'frais',   pecheur_id: pecheurs[1].id, statut: 'disponible', description: 'Grosses crevettes sauvages de l\'estuaire. Produit premium très demandé par les hôtels et restaurants.' },
        { type_poisson: 'Crevettes grises',         categorie: 'Crustaces',       poids_kg: 15,  prix_unitaire: 45000, date_capture: today, lieu_capture: 'Benty, Forecariah',     etat: 'frais',   pecheur_id: pecheurs[2].id, statut: 'disponible', description: 'Crevettes de taille moyenne, très savoureuses. Idéales pour les plats de riz et les sauces.' },
        { type_poisson: 'Homard',                   categorie: 'Crustaces',       poids_kg: 5,   prix_unitaire: 120000,date_capture: today, lieu_capture: 'Conakry, Boulbinet',   etat: 'frais',   pecheur_id: pecheurs[0].id, statut: 'disponible', description: 'Homard sauvage de l\'Atlantique. Produit d\'exception pour les restaurants gastronomiques et hôtels 5 étoiles.' },
        { type_poisson: 'Crabe de mer',             categorie: 'Crustaces',       poids_kg: 12,  prix_unitaire: 35000, date_capture: today, lieu_capture: 'Dubréka, Tanènè',       etat: 'frais',   pecheur_id: pecheurs[5].id, statut: 'disponible', description: 'Crabe sauvage de l\'estuaire. Chair douce et délicate, idéal pour les soupes et plats de fête.' },
        { type_poisson: 'Langouste',                categorie: 'Crustaces',       poids_kg: 6,   prix_unitaire: 95000, date_capture: today, lieu_capture: 'Boké, Kamsar',          etat: 'frais',   pecheur_id: pecheurs[1].id, statut: 'disponible', description: 'Langouste sauvage de roche. Très prisée dans la restauration haut de gamme.' },
        { type_poisson: 'Poulpe',                   categorie: 'Mollusques',      poids_kg: 10,  prix_unitaire: 28000, date_capture: hier,  lieu_capture: 'Benty, Forecariah',     etat: 'frais',   pecheur_id: pecheurs[2].id, statut: 'disponible', description: 'Poulpe sauvage de l\'Atlantique. Chair tendre après cuisson, idéal en salade ou à la plancha.' },
        { type_poisson: 'Poulpe séché',             categorie: 'Mollusques',      poids_kg: 8,   prix_unitaire: 40000, date_capture: hier,  lieu_capture: 'Coyah, Wonkifong',      etat: 'seche',   pecheur_id: pecheurs[4].id, statut: 'disponible', description: 'Poulpe séché traditionnellement au soleil. Condiment essentiel dans de nombreux plats guinéens.' },
        { type_poisson: 'Calmars',                  categorie: 'Mollusques',      poids_kg: 9,   prix_unitaire: 32000, date_capture: today, lieu_capture: 'Conakry, Boulbinet',   etat: 'frais',   pecheur_id: pecheurs[0].id, statut: 'disponible', description: 'Calmars frais de l\'Atlantique. Très polyvalents en cuisine : frits, farcis ou en sauce.' },
        { type_poisson: 'Huîtres de palétuvier',    categorie: 'Mollusques',      poids_kg: 20,  prix_unitaire: 15000, date_capture: today, lieu_capture: 'Dubréka, Tanènè',       etat: 'frais',   pecheur_id: pecheurs[5].id, statut: 'disponible', description: 'Huîtres sauvages des mangroves guinéennes. Très appréciées grillées ou en sauce locale.' },
        { type_poisson: 'Rouget barbet',            categorie: 'Poisson de fond', poids_kg: 14,  prix_unitaire: 36000, date_capture: today, lieu_capture: 'Conakry, Matam',        etat: 'frais',   pecheur_id: pecheurs[3].id, statut: 'disponible', description: 'Poisson de fond à chair fine et parfumée. Très apprécié grillé avec des herbes.' },
        { type_poisson: 'Pageot',                   categorie: 'Poisson de fond', poids_kg: 16,  prix_unitaire: 30000, date_capture: today, lieu_capture: 'Boké, Kamsar',          etat: 'frais',   pecheur_id: pecheurs[1].id, statut: 'disponible', description: 'Poisson de fond savoureux, proche de la dorade. Excellent en grillade ou au court-bouillon.' },
        { type_poisson: 'Mulet',                    categorie: 'Poisson de fond', poids_kg: 28,  prix_unitaire: 20000, date_capture: today, lieu_capture: 'Benty, Forecariah',     etat: 'frais',   pecheur_id: pecheurs[2].id, statut: 'disponible', description: 'Poisson côtier très commun. Chair savoureuse, idéal pour le thiéboudienne et les bouillons.' },
        { type_poisson: 'Carpe de mer',             categorie: 'Poisson de fond', poids_kg: 22,  prix_unitaire: 25000, date_capture: hier,  lieu_capture: 'Coyah, Wonkifong',      etat: 'frais',   pecheur_id: pecheurs[4].id, statut: 'disponible', description: 'Poisson de fond à chair blanche. Très utilisé dans la cuisine familiale et les restaurants populaires.' },
        { type_poisson: 'Thiof séché',              categorie: 'Produit seche',   poids_kg: 15,  prix_unitaire: 65000, date_capture: hier,  lieu_capture: 'Conakry, Boulbinet',   etat: 'seche',   pecheur_id: pecheurs[0].id, statut: 'disponible', description: 'Thiof séché et fumé artisanalement. Condiment de luxe pour les sauces et le thiéboudienne.' },
        { type_poisson: 'Capitaine fumé',           categorie: 'Produit seche',   poids_kg: 12,  prix_unitaire: 50000, date_capture: hier,  lieu_capture: 'Boké, Kamsar',          etat: 'seche',   pecheur_id: pecheurs[1].id, statut: 'disponible', description: 'Capitaine fumé au bois de mangrove. Arôme intense, très recherché pour les plats de fête.' },
        { type_poisson: 'Sardines séchées',         categorie: 'Produit seche',   poids_kg: 25,  prix_unitaire: 18000, date_capture: hier,  lieu_capture: 'Benty, Forecariah',     etat: 'seche',   pecheur_id: pecheurs[2].id, statut: 'disponible', description: 'Sardines séchées au soleil. Condiment de base dans la cuisine guinéenne, longue conservation.' },
        { type_poisson: 'Thon albacore congelé',    categorie: 'Congele',         poids_kg: 100, prix_unitaire: 28000, date_capture: hier,  lieu_capture: 'Conakry, Boulbinet',   etat: 'congele', pecheur_id: pecheurs[0].id, statut: 'disponible', description: 'Thon congelé en mer, qualité export. Idéal pour les restaurants et les commandes en gros.' },
        { type_poisson: 'Crevettes congelées',      categorie: 'Congele',         poids_kg: 30,  prix_unitaire: 40000, date_capture: hier,  lieu_capture: 'Boké, Kamsar',          etat: 'congele', pecheur_id: pecheurs[1].id, statut: 'disponible', description: 'Crevettes congelées à bord, qualité premium. Disponibles toute l\'année pour les professionnels.' },
    ].map(withPhoto));

    await Commande.bulkCreate([
        { acheteur_id: acheteurs[0].id, produit_id: produits[0].id, pecheur_id: pecheurs[0].id, quantite_kg: 5,  prix_total: 275000, statut: 'livree',    evaluation_note: 5, evaluation_commentaire: 'Thiof exceptionnel, très frais !', lieu_livraison: 'Conakry, Ratoma' },
        { acheteur_id: restos[0].id,    produit_id: produits[13].id,pecheur_id: pecheurs[1].id, quantite_kg: 3,  prix_total: 225000, statut: 'confirmee', lieu_livraison: 'Conakry, Kipé' },
        { acheteur_id: restos[1].id,    produit_id: produits[15].id,pecheur_id: pecheurs[0].id, quantite_kg: 2,  prix_total: 240000, statut: 'en_attente',lieu_livraison: 'Conakry, Kaloum' },
        { acheteur_id: acheteurs[1].id, produit_id: produits[6].id, pecheur_id: pecheurs[0].id, quantite_kg: 10, prix_total: 320000, statut: 'livree',    evaluation_note: 4, evaluation_commentaire: 'Bon thon, livraison rapide.', lieu_livraison: 'Conakry, Kaloum' },
        { acheteur_id: restos[2].id,    produit_id: produits[3].id, pecheur_id: pecheurs[3].id, quantite_kg: 8,  prix_total: 360000, statut: 'en_preparation', lieu_livraison: 'Conakry, Boulbinet' },
    ]);

    await Notification.bulkCreate([
        { utilisateur_id: pecheurs[0].id, type: 'commande', titre: 'Nouvelle commande', contenu: 'Fatoumata Soumah a commandé 5 kg de Thiof.' },
        { utilisateur_id: acheteurs[0].id, type: 'commande', titre: 'Commande livrée', contenu: 'Votre commande de Thiof a été livrée avec succès.' },
        { utilisateur_id: pecheurs[1].id, type: 'commande', titre: 'Nouvelle commande', contenu: 'Restaurant Le Palmier a commandé 3 kg de Crevettes royales.' },
        { utilisateur_id: restos[1].id, type: 'commande', titre: 'Commande en attente', contenu: 'Votre commande de Homard est en attente de confirmation.' },
    ]);

    console.log('\n=== RESET TERMINE ===');
    console.log('Admin       : 620000000 / admin123');
    console.log('Pecheur     : 620111111 / pecheur123');
    console.log('Acheteur    : 620444444 / acheteur123');
    console.log('Restaurant  : 620666666 / resto123');
    console.log('Livreur     : 621300001 / livreur123');
    console.log(`Produits    : ${produits.length} types de poisson`);
};

const seed = async () => {
    try {
        if (RESET) {
            await seedComplet();
        } else {
            await sequelize.sync({ alter: true });
            const nbUsers = await Utilisateur.count();
            const nbProduits = await Produit.count();
            const misAJour = await mettreAJourPhotos();
            console.log('\n=== SEED (mode sûr) ===');
            console.log(`Utilisateurs conservés : ${nbUsers}`);
            console.log(`Produits en base       : ${nbProduits}`);
            console.log(`Photos mises à jour    : ${misAJour}`);
            console.log('\nLes comptes existants n\'ont pas été modifiés.');
            console.log('Pour tout effacer et repartir de zéro : node seed.js --reset');
        }

        process.exit(0);
    } catch (erreur) {
        console.error('Erreur seed :', erreur);
        process.exit(1);
    }
};

seed();
