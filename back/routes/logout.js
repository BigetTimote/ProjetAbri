const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  // Côté client, il faudra supprimer le token du localStorage ou des cookies.
  res.json({ message: "Déconnexion réussie. Pensez à supprimer le token côté client." });
});

module.exports = router;