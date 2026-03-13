const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const KEYS_DIR = path.join(__dirname, '..', 'keys');

if (!fs.existsSync(KEYS_DIR)) {
  fs.mkdirSync(KEYS_DIR, { recursive: true });
}

const users = ['userA', 'userB'];

users.forEach((user) => {
  console.log(`🔑 Generating RSA-2048 key pair for ${user}...`);

  const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'spki',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs8',
      format: 'pem',
    },
  });

  fs.writeFileSync(path.join(KEYS_DIR, `${user}_public.pem`), publicKey);
  fs.writeFileSync(path.join(KEYS_DIR, `${user}_private.pem`), privateKey);

  console.log(`   ✅ Saved: keys/${user}_public.pem`);
  console.log(`   ✅ Saved: keys/${user}_private.pem`);
});

console.log('\n✅ All key pairs generated successfully!');
console.log('⚠️  Keep the private keys confidential — never share them.\n');
