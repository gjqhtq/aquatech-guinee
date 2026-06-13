// ========================================
// SERVEUR PRINCIPAL - AquaTech Guinée
// ========================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const path = require('path');
require('dotenv').config();

const { sequelize, testConnexion } = require('./config/database');
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const produitRoutes = require('./routes/produitRoutes');
const commandeRoutes = require('./routes/commandeRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const stockRoutes = require('./routes/stockRoutes');
const preferencesNotificationRoutes = require('./routes/preferencesNotificationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const { annulationAuto, alerteProduitNonVendu, alerteStockBas } = require('./cron/jobs');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fichiers statiques pour les photos de produits
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir les fichiers statiques du frontend React en production
if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '..', 'frontend', 'build');
  app.use(express.static(frontendBuildPath));

  // Catch-all pour le routing côté client (React Router)
  app.get('/*', (req, res) => {
    if (!req.path.startsWith('/api/') && !req.path.startsWith('/api/uploads')) {
      res.sendFile(path.join(frontendBuildPath, 'index.html'));
    }
  });
}

// Routes API
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/produits', produitRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/preferences-notification', preferencesNotificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API AquaTech Guinee - Serveur en marche !', version: '2.0' });
});

// Démarrage uniquement si ce fichier est exécuté directement
if (require.main === module) {
  const demarrer = async () => {
    await testConnexion();
    await sequelize.sync({ alter: true });
    console.log('Tables synchronisees avec MySQL');

    const PORT = process.env.PORT || 5000;
    const server = http.createServer(app);
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\nErreur : le port ${PORT} est deja utilise.`);
        console.error('Un autre serveur tourne deja — arretez-le avec :');
        console.error(`  fuser -k ${PORT}/tcp`);
        console.error('Ou trouvez le processus avec :');
        console.error(`  lsof -i :${PORT}`);
        process.exit(1);
      }
      throw err;
    });

    server.listen(PORT, () => {
      console.log(`Serveur AquaTech demarre sur le port ${PORT}`);
      console.log(`API disponible sur http://localhost:${PORT}`);
      annulationAuto.start();
      alerteProduitNonVendu.start();
      alerteStockBas.start();
      console.log('Cron jobs demarres.');
    });
  };

  demarrer();
}

// Export pour Vercel
module.exports = app;