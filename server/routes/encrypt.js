
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { encryptPDF } = require('../utils/crypto');

const router = express.Router();

// Store uploads in memory (no disk I/O needed)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

const KEYS_DIR = path.join(__dirname, '..', '..', 'keys');
const VALID_USERS = ['userA', 'userB'];

router.post('/', upload.single('pdf'), (req, res) => {
  try {
    const { recipient } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No PDF file uploaded.' });
    }
    if (!recipient || !VALID_USERS.includes(recipient)) {
      return res.status(400).json({ error: 'Invalid recipient. Choose userA or userB.' });
    }

    // Load recipient's public key
    const pubKeyPath = path.join(KEYS_DIR, `${recipient}_public.pem`);
    if (!fs.existsSync(pubKeyPath)) {
      return res.status(500).json({
        error: `Public key for ${recipient} not found. Run: node scripts/generateKeys.js`,
      });
    }
    const publicKeyPem = fs.readFileSync(pubKeyPath, 'utf8');

    // Encrypt
    const envelope = encryptPDF(req.file.buffer, publicKeyPem, req.file.originalname);
    const envelopeJson = JSON.stringify(envelope, null, 2);

    // Send as downloadable file
    const outName = `${path.parse(req.file.originalname).name}_encrypted_for_${recipient}.enc`;
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    res.send(Buffer.from(envelopeJson, 'utf8'));
  } catch (err) {
    console.error('Encryption error:', err);
    res.status(500).json({ error: 'Encryption failed: ' + err.message });
  }
});

module.exports = router;
