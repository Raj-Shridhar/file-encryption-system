const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { encryptPDF, decryptPDF } = require('../server/utils/crypto');

const KEYS_DIR = path.join(__dirname, '..', 'keys');
const TEST_DIR  = path.join(__dirname, '..', 'test');

// ── helpers ────────────────────────────────────────────────────────────────
function loadKey(filename) {
  const p = path.join(KEYS_DIR, filename);
  if (!fs.existsSync(p)) {
    throw new Error(`Key file not found: ${p}\nRun: node scripts/generateKeys.js`);
  }
  return fs.readFileSync(p, 'utf8');
}

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✅ PASS — ${label}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL — ${label}`);
    failed++;
  }
}

// ── create a fake PDF-like test file ──────────────────────────────────────
if (!fs.existsSync(TEST_DIR)) fs.mkdirSync(TEST_DIR, { recursive: true });
const samplePath = path.join(TEST_DIR, 'sample.pdf');
if (!fs.existsSync(samplePath)) {
  // Minimal valid PDF structure
  const fakePdf = Buffer.from(
    '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
    '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
    '3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R>>endobj\n' +
    'xref\n0 4\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n0\n%%EOF'
  );
  fs.writeFileSync(samplePath, fakePdf);
}

// ── run tests ─────────────────────────────────────────────────────────────
console.log('\n🔐 PDF Encryption System — Crypto Tests\n');

try {
  const userA_pub  = loadKey('userA_public.pem');
  const userA_priv = loadKey('userA_private.pem');
  const userB_pub  = loadKey('userB_public.pem');
  const userB_priv = loadKey('userB_private.pem');
  const original   = fs.readFileSync(samplePath);

  // Test 1: Encrypt for User B → Decrypt with User B's private key
  console.log('Test 1: Encrypt for User B, Decrypt with User B\'s private key');
  const envelope = encryptPDF(original, userB_pub, 'sample.pdf');
  assert(typeof envelope.encryptedKey === 'string', 'envelope has encryptedKey');
  assert(typeof envelope.iv === 'string',           'envelope has iv');
  assert(typeof envelope.encryptedData === 'string','envelope has encryptedData');

  const decrypted = decryptPDF(envelope, userB_priv);
  assert(Buffer.isBuffer(decrypted),                     'decrypted result is a Buffer');
  assert(decrypted.equals(original),                     'decrypted content matches original bytes');

  // Test 2: Encrypt for User A → Decrypt with User A's private key
  console.log('\nTest 2: Encrypt for User A, Decrypt with User A\'s private key');
  const envA = encryptPDF(original, userA_pub, 'sample.pdf');
  const decA = decryptPDF(envA, userA_priv);
  assert(decA.equals(original), 'User A roundtrip is byte-perfect');

  // Test 3: Encrypted for User B → Decrypt attempt with User A's private key (MUST fail)
  console.log('\nTest 3: Decrypt with WRONG private key (must throw)');
  let wrongKeyThrew = false;
  try {
    decryptPDF(envelope, userA_priv);
  } catch {
    wrongKeyThrew = true;
  }
  assert(wrongKeyThrew, 'Decryption with wrong key throws an error ✔');

  // Test 4: Each encryption produces different ciphertext (random IV)
  console.log('\nTest 4: Each encryption is unique (random AES key + IV)');
  const env2 = encryptPDF(original, userB_pub, 'sample.pdf');
  assert(envelope.encryptedData !== env2.encryptedData, 'Two encryptions produce different ciphertext');
  assert(envelope.iv            !== env2.iv,            'Two encryptions have different IVs');

} catch (err) {
  console.error('\n💥 Test setup error:', err.message);
  process.exit(1);
}

// ── summary ───────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(45)}`);
console.log(`Results: ${passed} passed, ${failed} failed`);
if (failed === 0) {
  console.log('🎉 All tests passed! The encryption system is working correctly.\n');
} else {
  console.log('⚠️  Some tests failed. Please review the output above.\n');
  process.exit(1);
}
