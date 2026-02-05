const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(403).json({ message: "403 Forbidden : Token manquant" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "403 Forbidden : Token invalide" });
    }
    // On attache les infos décodées à req.user pour que routes/solde.js puisse les lire
    req.user = decoded; 
    next();
  });
};