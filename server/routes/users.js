/**
 * users.js — GET /api/users
 * Returns the list of users and their RSA public keys.
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();
const KEYS_DIR = path.join(__dirname, '..', '..', 'keys');
const USERS = ['userA', 'userB'];

router.get('/', (req, res) => {
  const users = USERS.map((user) => {
    const pubKeyPath = path.join(KEYS_DIR, `${user}_public.pem`);
    const hasKeys = fs.existsSync(pubKeyPath);
    return {
      id: user,
      label: user === 'userA' ? 'User A (Alice)' : 'User B (Bob)',
      publicKey: hasKeys ? fs.readFileSync(pubKeyPath, 'utf8') : null,
      keysReady: hasKeys,
    };
  });
  res.json({ users });
});

module.exports = router;
