const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { body } = require('express-validator');
const { authentifier, autoriser } = require('../middleware/auth');
const {
    ajouterProduit, modifierProduit, changerStatutProduit,
    listerProduits, detailProduit, mesProduits
} = require('../controllers/produitController');

const uploadDir = path.join(__dirname, '..', 'uploads', 'products');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname).toLowerCase();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}-${safeName}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.test(ext)) cb(null, true);
    else cb(new Error('Format d\'image non supporté. Utilisez JPG, PNG ou WEBP.'));
  }
});

const handleUpload = (req, res, next) => {
  const contentType = req.headers['content-type'] || '';
  if (contentType.startsWith('multipart/form-data')) {
    return upload.array('photos', 3)(req, res, next);
  }
  next();
};

const validationProduit = [
    body('type_poisson').trim().notEmpty().withMessage('Le type de poisson est obligatoire.'),
    body('poids_kg').isFloat({ min: 0.1 }).withMessage('Le poids doit être supérieur à 0.'),
    body('prix_unitaire').isInt({ min: 1 }).withMessage('Le prix doit être supérieur à 0.'),
    body('date_capture').notEmpty().withMessage('La date de capture est obligatoire.'),
    body('lieu_capture').trim().notEmpty().withMessage('Le lieu de capture est obligatoire.')
];

// Routes publiques
router.get('/', listerProduits);
router.get('/:id', detailProduit);

// Routes protégées (pêcheur)
router.post('/', authentifier, autoriser('pecheur', 'admin'), handleUpload, validationProduit, ajouterProduit);
router.put('/:id', authentifier, handleUpload, modifierProduit);
router.put('/:id/statut', authentifier, changerStatutProduit);
router.get('/mes/produits', authentifier, mesProduits);

module.exports = router;
