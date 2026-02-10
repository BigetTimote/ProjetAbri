const express = require('express');
const router = express.Router();

// POST /logout
router.post('/', (req, res) => {
    // Dans un système JWT simple, le serveur ne fait rien de spécial.
    // Si tu voulais invalider le token, il faudrait une "blacklist" en base de données.
    res.json({ 
        message: "Déconnexion réussie.",
        instruction: "Veuillez supprimer le JWT du localStorage." 
    });
});

module.exports = router;