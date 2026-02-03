const express = require('express');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// Configuration de la connexion à MariaDB
const connection = mysql.createConnection({
  host: '172.29.16.155',
  user: 'root',      // Votre nom d'utilisateur MariaDB
  password: 'root',      // Votre mot de passe MariaDB
  database: 'Abri'   // Le nom de votre base de données
});

// Tentative de connexion
connection.connect((err) => {
  if (err) {
    console.error('Erreur de connexion à MariaDB : ' + err.stack);
    return;
  }
    console.log('Connecté à MariaDB');
});

// Le serveur écoute sur le port 3000
app.listen(port, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${port}`);
});