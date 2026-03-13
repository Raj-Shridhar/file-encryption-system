/**
 * decrypt.js — POST /api/decrypt
 * Accepts: multipart/form-data { encFile: <.enc file>, user: "userA"|"userB" }
 * Returns: Decrypted PDF as a download
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { decryptPDF } = require('../utils/crypto');

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100 MB max (encrypted files are larger)
});

const KEYS_DIR = path.join(__dirname, '..', '..', 'keys');
const VALID_USERS = ['userA', 'userB'];

router.post('/', upload.single('encFile'), (req, res) => {
  try {
    const { user } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'No .enc file uploaded.' });
    }
    if (!user || !VALID_USERS.includes(user)) {
      return res.status(400).json({ error: 'Invalid user. Choose userA or userB.' });
    }

    // Load user's private key
    const privKeyPath = path.join(KEYS_DIR, `${user}_private.pem`);
    if (!fs.existsSync(privKeyPath)) {
      return res.status(500).json({
        error: `Private key for ${user} not found. Run: node scripts/generateKeys.js`,
      });
    }
    const privateKeyPem = fs.readFileSync(privKeyPath, 'utf8');

    // Parse the envelope JSON
    let envelope;
    try {
      envelope = JSON.parse(req.file.buffer.toString('utf8'));
    } catch {
      return res.status(400).json({ error: 'Invalid .enc file format.' });
    }

    // Decrypt
    const pdfBuffer = decryptPDF(envelope, privateKeyPem);

    // Send as downloadable PDF
    const originalName = envelope.originalName || 'decrypted_document.pdf';
    const outName = `decrypted_${path.parse(originalName).name}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${outName}"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Decryption error:', err);
    // Give a clear error for wrong-key attempts
    const isKeyError =
      err.message.includes('error:') || err.message.includes('RSA') || err.message.includes('OAEP');
    const friendlyMsg = isKeyError
      ? 'Decryption failed: wrong private key or corrupted file.'
      : 'Decryption failed: ' + err.message;
    res.status(400).json({ error: friendlyMsg });
  }
});

module.exports = router;
