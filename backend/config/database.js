// ========================================
// CONFIGURATION DE LA BASE DE DONNÉES MySQL
// ========================================
// Ce fichier gère la connexion entre le serveur Node.js et MySQL
// Sequelize est l'outil (ORM) qui traduit le JavaScript en requêtes SQL

const { Sequelize } = require('sequelize');
require('dotenv').config();

// Debug: Log environment variables (mask password)
console.log('=== DEBUG: Environment Variables ===');
console.log('DB_HOST:', process.env.DB_HOST || 'UNSET');
console.log('DB_PORT:', process.env.DB_PORT || 'UNSET');
console.log('DB_NAME:', process.env.DB_NAME || 'UNSET');
console.log('DB_USER:', process.env.DB_USER || 'UNSET');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '****' : 'UNSET');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '****' : 'UNSET');
console.log('JWT_EXPIRES_IN:', process.env.JWT_EXPIRES_IN || 'UNSET');
console.log('====================================');

// Création de la connexion à MySQL avec les identifiants du fichier .env
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: 'mysql',
    logging: false,
    timezone: '+00:00',
    define: {
        timestamps: true,
        underscored: true
        }
    }
);

// Test de la connexion
const testConnexion = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connexion à MySQL réussie');
    } catch (erreur) {
    console.error('Erreur de connexion à MySQL :', erreur.message);
    }
};

module.exports = { sequelize, testConnexion };
