require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { WebSocketServer } = require('ws');

// Imports des modules personnalisés
const initResetJob = require('./jobs/resetCredits');
const registerRoutes = require('./routes/register');
const loginRoutes = require('./routes/login');
const logoutRoutes = require('./routes/logout');
const soldeRoutes = require('./routes/solde');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // Sert index.html, css/ et js/

// Initialisation du reset hebdomadaire (Lundi 2h)
initResetJob();

// Routes API
app.use('/register', registerRoutes);
app.use('/login', loginRoutes);
app.use('/logout', logoutRoutes);
app.use('/api/solde', soldeRoutes);
app.use('/auth', authRoutes);

// WebSocket
wss.on('connection', (ws) => {
    console.log('Client WS connecté');
    ws.on('message', (data) => console.log(`Reçu: ${data}`));
});

server.listen(port, () => {
    console.log(`Serveur Abri tournant sur http://172.29.16.155:${port}`);
});