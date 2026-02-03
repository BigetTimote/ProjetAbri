require('dotenv').config(); // Charge les variables du fichier .env
const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = process.env.PORT || 3000;

// Configuration de la connexion utilisant les variables d'environnement
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à MariaDB : ' + err.stack);
    return;
  }
  console.log('Connecté à MariaDB');
});

app.get('/', (req, res) => {
  res.send('Serveur opérationnel avec config sécurisée !');
});

app.listen(port, () => {
  console.log(`Serveur lancé sur le port ${port}`);
});