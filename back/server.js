require('dotenv').config();
const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const port = process.env.PORT || 3000;

app.use(express.json());

// --- Import des routes ---
const loginRoutes = require('./routes/login');
const logoutRoutes = require('./routes/logout');
const authRoutes = require('./routes/auth');
const verifyToken = require('./middleware/authMiddleware');

// --- Utilisation des routes ---
app.use('/login', loginRoutes);
app.use('/logout', logoutRoutes);
app.use('/auth', authRoutes);

// Route protégée d'exemple
app.get('/api/secure-data', verifyToken, (req, res) => {
  res.json({ message: "Accès autorisé", user: req.user });
});

// --- WebSocket ---
wss.on('connection', (ws) => {
  console.log('Client connecté au WS');
  ws.on('message', (msg) => console.log(`WS reçu: ${msg}`));
});

server.listen(port, () => {
  console.log(`Serveur complet lancé sur le port ${port}`);
});