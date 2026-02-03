const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Récupère le token après "Bearer"

  if (!token) {
    return res.status(403).json({ message: "403 Forbidden : Token manquant" });
  }

  // Vérification de la signature du token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "403 Forbidden : Token invalide ou expiré" });
    }

    // On ajoute les infos de l'utilisateur à l'objet 'req' pour les routes suivantes
    req.user = user;
    next();
  });
};