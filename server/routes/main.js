// Routes principales Express
const express = require('express');
const router = express.Router();
const path = require('path');

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/index.html'));
});

router.get('/experience', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/experience.html'));
});

// ... autres routes ...

module.exports = router;
