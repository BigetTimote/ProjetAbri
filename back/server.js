require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// --- Import des routes ---
const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');
const logoutRoutes = require('./routes/logout');
const soldeRoutes = require('./routes/solde'); // Nouveau fichier

// --- Utilisation des routes ---
app.use('/register', registerRoutes);
app.use('/login', loginRoutes);
app.use('/logout', logoutRoutes);
app.use('/api/solde', soldeRoutes); // Route renommée et isolée

// WebSocket (Exemple basique)
wss.on('connection', (ws) => {
  ws.on('message', (msg) => console.log(`WS reçu: ${msg}`));
});

server.listen(port, () => {
  console.log(`Serveur opérationnel sur le port ${port}`);
});