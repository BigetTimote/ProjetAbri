const express = require('express');
const router = express.Router();
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

router.post('/', (req, res) => {
  const { username, password } = req.body; // 'username' du front sera comparé au 'nom' en BDD

  if (!username || !password) {
    return res.status(400).json({ error: "Identifiants manquants" });
  }

  const sql = "SELECT * FROM users WHERE nom = ? AND password = ?";
  db.query(sql, [username, password], (err, results) => {
    if (err) return res.status(500).json({ error: "Erreur serveur" });

    if (results.length > 0) {
      const user = results[0];
      // Création du token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      res.json({ message: "Connexion réussie", token: token });
    } else {
      res.status(401).json({ error: "Nom d'utilisateur ou mot de passe incorrect" });
    }
  });
});

module.exports = router;