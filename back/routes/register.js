const express = require('express');
const router = express.Router();
const mysql = require('mysql2');

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

router.post('/', (req, res) => {
  // On récupère ce que le formulaire envoie
  const { nom, prenom, password, classe } = req.body;

  if (!nom || !password) {
    return res.status(400).json({ error: "Nom et mot de passe requis" });
  }

  // Insertion avec tes vraies colonnes
  // On met des valeurs par défaut pour badge_uid et credit_temps pour le test
  const insertSql = `
    INSERT INTO users (nom, prenom, classe, password, badge_uid, credit_temps) 
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  
  const values = [
    nom, 
    prenom || '', 
    classe || 'BTS', 
    password, 
    'TEMP_' + Date.now(), // Badge temporaire
    25 // Crédit temps initial
  ];

  db.query(insertSql, values, (err, result) => {
    if (err) {
      console.error("ERREUR INSERTION:", err);
      return res.status(500).json({ error: "Erreur insertion", details: err.message });
    }
    res.status(201).json({ message: "Utilisateur créé !", userId: result.insertId });
  });
});

module.exports = router;