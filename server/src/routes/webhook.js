const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');
const path = require('path');
const router = express.Router();

router.post('/deploy', express.raw({ type: 'application/json' }), (req, res) => {
  const secret = process.env.WEBHOOK_SECRET;
  const signature = req.headers['x-hub-signature-256'];

  if (secret) {
    const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(req.body).digest('hex');
    if (signature !== expected) {
      return res.status(401).json({ message: 'Invalid signature' });
    }
  }

  res.json({ message: 'Deploy triggered' });

  const projectRoot = path.join(__dirname, '../../../');
  const cmd = `cd ${projectRoot} && git pull origin main && cd client && npm install --include=dev && node node_modules/vite/bin/vite.js build && cd ../server && npm install && touch ../tmp/restart.txt`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) console.error('Deploy error:', stderr);
    else console.log('Deploy success:', stdout);
  });
});

module.exports = router;
