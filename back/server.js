require('dotenv').config();
const express = require('express');
const app = express();

app.use(express.json());

const authRoutes = require('./routes/auth');
const verifyToken = require('./middleware/authMiddleware');

// Route publique pour générer le token
app.use('/auth', authRoutes);

// Route protégée par le middleware JWT
app.get('/api/mon-profil', verifyToken, (req, res) => {
  res.json({
    message: "Accès autorisé",
    user: req.user
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Serveur JWT lancé sur le port ${port}`);
});