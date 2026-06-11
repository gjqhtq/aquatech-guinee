const faq = [
  {
    mots: ['bonjour', 'salut', 'bonsoir', 'hello', 'allo', 'coucou', 'hey', 'bjr', 'slt', 'hi'],
    reponse: "Bonjour 👋 ! Je suis l'assistant AquaTech Guinée. Je peux vous aider avec :\n• 🛒 Les commandes et achats\n• 🎣 Vente de produits (pêcheurs)\n• 📦 Livraisons\n• 🐟 Le catalogue\n• 💬 Les messages\n\nQue puis-je faire pour vous ?"
  },
  {
    mots: ['inscription', 'inscrire', 'créer compte', 'nouveau compte', 'enregistrer', 'rejoindre', 'je veux créer', 'comment créer', 'ouvrir un compte', 'comment m inscrire', 'comment s inscrire', 'register'],
    reponse: "📝 **Créer un compte :**\n\n1️⃣ Cliquez sur **S'inscrire**\n2️⃣ Renseignez :\n   • Nom\n   • Numéro de téléphone (ex: +224...)\n   • Votre localisation\n3️⃣ Choisissez votre rôle :\n   🛒 Acheteur → acheter du poisson\n   🎣 Pêcheur → vendre vos produits\n   🍽️ Restaurant → achats en gros\n   📦 Distributeur → gérer livraisons\n   🚚 Livreur → effectuer livraisons\n4️⃣ Confirmez - C'est gratuit ✨"
  },
  {
    mots: ['connexion', 'connecter', 'login', 'se connecter', 'comment se connecter', 'acceder', 'entrer', 'oublié', 'mot de passe oublié', 'réinitialiser mot de passe', 'mdp', 'password'],
    reponse: "🔐 **Se connecter :**\n\n1️⃣ Cliquez sur **Connexion**\n2️⃣ Entrez votre numéro de téléphone\n3️⃣ Entrez votre mot de passe\n4️⃣ Cliquez sur **Connecter**\n\n❓ **Mot de passe oublié ?**\nContactez l'équipe AquaTech via la messagerie avec votre numéro de téléphone."
  },
  {
    mots: ['commander', 'commande', 'acheter', 'achat', 'passer commande', 'je veux acheter', 'comment acheter', 'comment commander', 'je veux du poisson', 'comment avoir', 'obtenir', 'faire une commande'],
    reponse: "🛒 **Passer une commande :**\n\n1️⃣ Allez dans le **Catalogue**\n2️⃣ Filtrez par type de poisson ou état (frais/congelé/séché)\n3️⃣ Cliquez sur un produit pour voir les détails\n4️⃣ Entrez la quantité désirée (kg)\n5️⃣ Indiquez le lieu de livraison\n6️⃣ Cliquez **Commander**\n\n⏰ **Ensuite :**\n• Le pêcheur a 2 heures pour accepter\n• Vous recevez une notification à chaque étape\n• Status : En attente → Confirmée → En préparation → En livraison → Livrée"
  },
  {
    mots: ['statut', 'suivi', 'ma commande', 'où est', 'commande en cours', 'état commande', 'suivre commande', 'voir commande', 'commande acceptée', 'commande refusée', 'livraison quand', 'avancement', 'progression'],
    reponse: "📍 **Suivi de commande :**\n\nAllez dans **Mes Commandes** pour voir :\n\n🕐 **En attente** — Pêcheur réfléchit (2h)\n✅ **Confirmée** — Pêcheur accepte\n🔧 **En préparation** — Pêcheur prépare\n🚚 **En livraison** — Livreur en route\n📦 **Livrée** — Arrivée chez vous ✨\n❌ **Annulée** — Refusée ou annulée\n\nVous recevez une notification à chaque changement 🔔"
  },
  {
    mots: ['annuler', 'annulation', 'supprimer commande', 'je veux annuler', 'comment annuler', 'cancel'],
    reponse: "❌ **Annuler une commande :**\n\nVous pouvez annuler une commande **seulement si elle est En attente** (avant que le pêcheur n'accepte).\n\n✔️ Allez dans **Mes Commandes**\n✔️ Cliquez sur **Annuler** (bouton rouge)\n\n⚠️ Une fois confirmée ou en préparation, l'annulation n'est plus possible. Contactez le pêcheur via messagerie."
  },
  {
    mots: ['publier produit', 'ajouter produit', 'vendre', 'mettre en vente', 'je suis pecheur', 'comment vendre', 'poster annonce', 'mes produits', 'nouveau produit', 'mon stock'],
    reponse: "🎣 **Vendre du poisson (Pêcheur) :**\n\n1️⃣ Allez dans **Mes Produits**\n2️⃣ Cliquez sur **Ajouter un produit**\n3️⃣ Remplissez :\n   • Type de poisson (ex: Brème, Carpe, Barbeau)\n   • Poids total (kg)\n   • Prix unitaire (FGN/kg)\n   • Date de capture\n   • État : 🟦 Frais | 🟪 Congelé | 🟫 Séché\n   • Description\n4️⃣ Validez\n\n✨ Votre produit est maintenant visible dans le catalogue !"
  },
  {
    mots: ['catalogue', 'liste produits', 'produits disponibles', 'voir les produits', 'quels poissons', 'stock', 'disponible', 'trouver poisson', 'chercher poisson', 'browse'],
    reponse: "🐟 **Parcourir le Catalogue :**\n\nLe catalogue est **accessible à tous** (même sans compte).\n\n✔️ Filtrez par :\n   • Type de poisson\n   • État (Frais/Congelé/Séché)\n   • Barre de recherche\n✔️ Cliquez sur un produit pour les détails\n✔️ Connectez-vous pour commander\n\n💡 **Astuce :** Comparez les prix et avis des pêcheurs !"
  },
  {
    mots: ['prix', 'combien', 'tarif', 'coût', 'frais', 'gratuit', 'payer', 'paiement', 'coût du service', 'montant', 'fee'],
    reponse: "💰 **Tarification :**\n\n✅ **Inscription** — Gratuit 🎉\n✅ **Navigation** — Gratuit\n✅ **Commandes** — Gratuit (paiement direct)\n\n💳 **Paiement des commandes :**\nSe fait directement entre acheteur et vendeur (en personne ou via Orange Money/MTN Money).\n\n⚠️ **Important :** AquaTech prend 0% de commission pour l'instant."
  },
  {
    mots: ['livraison', 'livrer', 'livreur', 'distributeur', 'comment livrer', 'prendre livraison', 'gérer livraison', 'mes livraisons', 'livraisons disponibles'],
    reponse: "🚚 **Gérer les livraisons (Livreur/Distributeur) :**\n\n1️⃣ Allez dans **Livraisons**\n2️⃣ Voyez les commandes confirmées en attente\n3️⃣ Cliquez **Prendre en charge**\n4️⃣ Allez chercher le produit\n5️⃣ Livrez à l'adresse indiquée\n6️⃣ Cliquez **Marquer comme livrée**\n\n📍 Voir **Mes livraisons en cours** pour le suivi"
  },
  {
    mots: ['message', 'messagerie', 'contacter', 'discuter', 'envoyer message', 'parler', 'chat', 'conversation', 'comment contacter', 'joindre', 'dm', 'contact'],
    reponse: "💬 **Messagerie :**\n\nDiscutez directement avec d'autres utilisateurs !\n\n✔️ Allez dans **Messagerie**\n✔️ Cliquez **Nouveau** pour démarrer\n✔️ Sélectionnez l'utilisateur\n✔️ Tapez votre message\n\n💡 **Cas d'usage :**\n• Poser des questions au pêcheur\n• Discuter du prix\n• Organiser livraisons\n• Contacter support"
  },
  {
    mots: ['notification', 'alerte', 'alertes', 'mes alertes', 'voir notifications', 'non lu', 'bell'],
    reponse: "🔔 **Notifications :**\n\nRecevez des alertes pour :\n✔️ Nouvelles commandes reçues (pêcheur)\n✔️ Acceptation/refus de commandes\n✔️ Changements de statut\n✔️ Nouveaux messages\n✔️ Alertes stock (bientôt disponible)\n\nAllez dans **Notifications** pour voir l'historique complet."
  },
  {
    mots: ['tableau de bord', 'dashboard', 'statistiques', 'stats', 'chiffre affaire', 'mes ventes', 'rapport', 'graphique', 'performance', 'analytics'],
    reponse: "📊 **Tableau de Bord :**\n\nVoyez vos performances en temps réel :\n\n📈 Chiffre d'affaires (jour/semaine/mois)\n📦 Nombre de commandes\n💹 Graphiques d'évolution\n🐟 État des stocks\n⭐ Notation moyenne\n\n✔️ Accessible depuis le menu après connexion"
  },
  {
    mots: ['profil', 'modifier profil', 'mes informations', 'changer nom', 'mettre à jour', 'mon compte', 'paramètres', 'settings', 'info'],
    reponse: "👤 **Gérer mon Profil :**\n\nModifiez vos infos dans **Profil** :\n\n✔️ Nom\n✔️ Téléphone\n✔️ Localisation\n✔️ Description (visible par autres)\n\n⚠️ Ces infos aident les autres utilisateurs à vous faire confiance. Mettez à jour régulièrement !"
  },
  {
    mots: ['évaluer', 'évaluation', 'note', 'avis', 'laisser avis', 'noter', 'commentaire', 'feedback', 'donner note', 'review'],
    reponse: "⭐ **Évaluation de commandes :**\n\nAprès réception (statut = Livrée) :\n\n1️⃣ Allez dans **Mes Commandes**\n2️⃣ Cliquez sur **Évaluer** (bouton orange)\n3️⃣ Donnez une note 1️⃣-5️⃣ ⭐\n4️⃣ Laissez un commentaire (optionnel)\n5️⃣ Validez\n\n💡 Les avis aident les autres acheteurs et améliorent la qualité !"
  },
  {
    mots: ['météo', 'meteo', 'temps', 'conditions', 'vent', 'pluie', 'mer', 'alerte météo', 'prévisions', 'sortir en mer', 'weather'],
    reponse: "🌊 **Conditions Météo Marines (Pêcheurs) :**\n\nVoyez les conditions en temps réel :\n\n🌡️ Température\n💨 Vitesse du vent (Faible/Modéré/Fort)\n🌧️ Précipitations\n🌊 État de la mer\n\n⚠️ **Alerte sortie en mer :**\n✅ Possible si vent faible ET pas de pluie\n❌ Prudence si vent modéré/fort\n\n📍 Voir aussi les prévisions 5 jours pour mieux planifier"
  },
  {
    mots: ['rôle', 'type compte', 'pecheur', 'acheteur', 'restaurant', 'distributeur', 'livreur', 'différence rôle', 'quel type choisir', 'role'],
    reponse: "🎯 **Choisir votre Rôle :**\n\n🛒 **Acheteur** — Acheter du poisson au meilleur prix\n\n🎣 **Pêcheur** — Vendre vos captures, gérer stock, recevoir commandes\n\n🍽️ **Restaurant** — Achats en gros, commandes régulières\n\n📦 **Distributeur** — Organiser les livraisons\n\n🚚 **Livreur** — Effectuer les livraisons et gagner\n\n⚙️ Choisi à l'inscription, modifiable via support."
  },
  {
    mots: ['admin', 'administration', 'signaler', 'abus', 'fraude', 'problème compte', 'suspendre', 'supprimer compte', 'report', 'moderation'],
    reponse: "⚠️ **Signaler un problème :**\n\n❌ Compte suspect / usurpation\n❌ Produit de mauvaise qualité\n❌ Arnaque / non-livraison\n❌ Langage abusif\n\n✔️ **Solution :**\n1️⃣ Allez dans **Messagerie**\n2️⃣ Contactez l'équipe AquaTech\n3️⃣ Décrivez le problème en détail\n4️⃣ Envoyez preuves si possible\n\n🛡️ Notre équipe modère et prend action"
  },
  {
    mots: ['aide', 'support', 'assistance', 'bug', 'erreur', 'ça marche pas', 'problème technique', 'ça fonctionne pas', 'page blanche', 'site lent', 'help'],
    reponse: "🆘 **Problème technique ?**\n\n❓ **Avant de contacter :**\n✔️ Videz le cache (Ctrl+Shift+Del)\n✔️ Actualisez la page (F5)\n✔️ Vérifiez votre connexion internet\n✔️ Essayez un autre navigateur\n\n📞 **Toujours pas résolu ?**\nAllez dans **Messagerie** → contactez support\nDécrivez :\n• Page concernée\n• Message d'erreur exact\n• Votre rôle / téléphone"
  },
  {
    mots: ['merci', 'super', 'parfait', 'ok', 'compris', 'bien', 'bonne journée', 'au revoir', 'bye', 'ciao', 'thanks', 'excellent'],
    reponse: "😊 Avec plaisir ! N'hésitez pas si vous avez d'autres questions.\n\nBonne utilisation de **AquaTech Guinée** ! 🐟🎉\n\n💡 **Astuce :** Explorez le Catalogue et connectez-vous pour commencer !"
  },
  {
    mots: ['rechercher', 'search', 'trouver', 'cherche', 'comment trouver', 'chercher pecheur', 'chercher acheteur'],
    reponse: "🔍 **Chercher des utilisateurs ou produits :**\n\n✔️ **Catalogue** — Filtrez par type/état de poisson\n✔️ **Messagerie** — Cherchez par nom/téléphone\n✔️ **Commandes** — Voyez vos historiques\n\n💡 Utilisez les mots-clés : type de poisson, lieu, prix"
  },
  {
    mots: ['comment ça marche', 'fonctionnement', 'expliquer', 'faq', 'tutoriel', 'guide', 'explique moi'],
    reponse: "📚 **Comment fonctionne AquaTech :**\n\n1️⃣ **Pêcheurs** publient leurs produits\n2️⃣ **Acheteurs** consultent le catalogue\n3️⃣ **Acheteurs** passent commande\n4️⃣ **Pêcheurs** acceptent/refusent (2h)\n5️⃣ **Pêcheurs** préparent\n6️⃣ **Livreurs** effectuent livraison\n7️⃣ **Acheteurs** évaluent\n\n🎯 **Objectif :** Relier pêcheurs et acheteurs directement, sans intermédiaire !"
  }
];

export default faq;
