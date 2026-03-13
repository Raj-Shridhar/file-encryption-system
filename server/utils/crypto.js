/**
 * crypto.js — Hybrid encryption utility
 *
 * Strategy:
 *   Encrypt:  generate random AES-256-CBC key → encrypt PDF with AES
 *             → encrypt AES key with recipient's RSA public key
 *             → bundle into JSON envelope
 *
 *   Decrypt:  decrypt AES key using recipient's RSA private key
 *             → decrypt PDF bytes using AES
 */

const crypto = require('crypto');

/**
 * Encrypts a PDF buffer for a given RSA public key.
 * @param {Buffer} pdfBuffer  - Raw bytes of the PDF file
 * @param {string} publicKeyPem - Recipient's RSA public key in PEM format
 * @returns {object} envelope  - { encryptedKey, iv, encryptedData, originalName } all base64
 */
function encryptPDF(pdfBuffer, publicKeyPem, originalName = 'document.pdf') {
  // 1. Generate a random 256-bit AES key and 128-bit IV
  const aesKey = crypto.randomBytes(32); // 256 bits
  const iv = crypto.randomBytes(16);     // 128 bits

  // 2. Encrypt the PDF bytes using AES-256-CBC
  const cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv);
  const encryptedData = Buffer.concat([cipher.update(pdfBuffer), cipher.final()]);

  // 3. Encrypt the AES key using the recipient's RSA public key (OAEP padding)
  const encryptedKey = crypto.publicEncrypt(
    {
      key: publicKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    aesKey
  );

  return {
    encryptedKey: encryptedKey.toString('base64'),
    iv: iv.toString('base64'),
    encryptedData: encryptedData.toString('base64'),
    originalName,
  };
}

/**
 * Decrypts an envelope produced by encryptPDF using the recipient's RSA private key.
 * @param {object} envelope    - { encryptedKey, iv, encryptedData }
 * @param {string} privateKeyPem - Recipient's RSA private key in PEM format
 * @returns {Buffer} - Decrypted PDF bytes
 */
function decryptPDF(envelope, privateKeyPem) {
  const { encryptedKey, iv, encryptedData } = envelope;

  // 1. Decrypt the AES key using the RSA private key
  const aesKey = crypto.privateDecrypt(
    {
      key: privateKeyPem,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'sha256',
    },
    Buffer.from(encryptedKey, 'base64')
  );

  // 2. Decrypt the PDF bytes using the recovered AES key
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    aesKey,
    Buffer.from(iv, 'base64')
  );

  const decryptedData = Buffer.concat([
    decipher.update(Buffer.from(encryptedData, 'base64')),
    decipher.final(),
  ]);

  return decryptedData;
}

module.exports = { encryptPDF, decryptPDF };
