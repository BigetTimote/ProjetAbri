require('dotenv').config();
const express = require('express');
const http = require('http'); // Requis pour WS
const path = require('path');
const { WebSocketServer } = require('ws'); // npm install ws

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

// Routes API
app.use('/register', require('./routes/register'));
app.use('/login', require('./routes/login'));
app.use('/api/solde', require('./routes/solde'));

app.use(express.static(path.resolve(__dirname, '..')));

// Gestion du WebSocket
wss.on('connection', (ws) => {
    console.log('Client connecté en temps réel');
    
    ws.on('message', (message) => {
        console.log('Reçu du client:', message.toString());
    });

    // Exemple : envoyer une mise à jour toutes les 10 secondes
    const interval = setInterval(() => {
        ws.send(JSON.stringify({ type: 'UPDATE_TIME', message: 'Mise à jour du solde...' }));
    }, 10000);

    ws.on('close', () => clearInterval(interval));
});

require('./jobs/resetCredits')();

server.listen(3000, () => {
    console.log("=== SERVEUR + WS OK SUR PORT 3000 ===");
});