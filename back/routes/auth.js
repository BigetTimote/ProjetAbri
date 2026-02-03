const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// Route : Générer un token JWT
router.post('/generate-token', (req, res) => {
  const { userId, username } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId manquant" });
  }

  // Création du token avec un payload (données) et une expiration (ex: 24h)
  const token = jwt.sign(
    { id: userId, name: username },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    message: "Token JWT généré",
    token: token
  });
});

module.exports = router;