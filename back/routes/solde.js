const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const verifyToken = require('../middleware/authMiddleware'); // Import de ton middleware

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

// On applique 'verifyToken' ici : la route ne répondra que si un JWT valide est fourni
router.get('/', verifyToken, (req, res) => {
  // Grâce au middleware, on a accès à req.user.id (extrait du token)
  const userId = req.user.id;

  const sql = "SELECT nom, prenom, credit_temps FROM users WHERE id = ?";
  
  db.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Erreur SQL solde:", err);
      return res.status(500).json({ error: "Erreur lors de la récupération du solde" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json({ 
      nom: results[0].nom, 
      prenom: results[0].prenom,
      credit: results[0].credit_temps 
    });
  });
});

module.exports = router;