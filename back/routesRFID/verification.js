// routesRFID/verification.js (VERSION MODIFIEE - Accès autorisés + Crédit épuisé)
const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { notifyArduino } = require('./arduino');

// Configuration de la connexion à la base de données
const dbConfig = {
    host: '172.29.16.155',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'Abri'
};

// Pool de connexions
const pool = mysql.createPool(dbConfig);

router.get('/', async (req, res) => {
    // 1. Récupération de l'ID du badge
    const rawId = req.query.id || "";
    const cardId = rawId.toUpperCase();

    // 2. Gestion de l'événement de retrait du badge (away=1)
    if (req.query.away === '1') {
        return res.status(200).send('<root><releaseId>1</releaseId></root>');
    }

    // Configuration de la réponse XML pour le lecteur matériel
    res.set('Content-Type', 'text/xml');

    console.log(`[INFO] Requête reçue pour le badge : ${cardId}`);

    try {
        // 3. Requête SQL vers la table 'users'
        const [rows] = await pool.execute(
            'SELECT * FROM users WHERE badge_uid = ?',
            [cardId]
        );

        // Si on trouve un utilisateur correspondant
        if (rows.length > 0) {
            const user = rows[0];
            console.log(`[ACCES OK] Utilisateur reconnu : ${user.prenom} ${user.nom}`);

            // 4. Vérification du crédit temps
            if (user.credit_temps <= 0 && user.is_admin === 0) {
                console.log(`[REFUS] Crédit temps épuisé pour ${user.prenom} ${user.nom}`);
                
                // ⚠️ NOTIFICATION ARDUINO pour crédit épuisé/négatif
                console.log(`[NOTIFICATION ARDUINO] Envoi - Crédit épuisé pour ${user.prenom} ${user.nom}`);
                
                notifyArduino({
                    access: 'denied',
                    badge: cardId,
                    user: `${user.prenom} ${user.nom}`,
                    credit: user.credit_temps,
                    reason: 'Crédit temps épuisé',
                    timestamp: new Date().toISOString()
                }).then(() => {
                    console.log(`[ARDUINO] ✓ Notification refus envoyée avec succès`);
                }).catch(err => {
                    console.error('[ARDUINO] ✗ Erreur notification:', err);
                });

                return res.status(401).send(`
                    <root>
                        <buzz>2</buzz>
                        <ledr>10,5,2</ledr>
                        <releaseId>1</releaseId>
                    </root>
                `);
            }

            // ✅ ACCÈS AUTORISÉ - NOTIFICATION ARDUINO UNIQUEMENT ICI
            console.log(`[NOTIFICATION ARDUINO] Envoi pour ${user.prenom} ${user.nom}`);
            
            notifyArduino({
                access: 'granted',
                badge: cardId,
                user: `${user.prenom} ${user.nom}`,
                credit: user.credit_temps,
                is_admin: user.is_admin,
                timestamp: new Date().toISOString()
            }).then(() => {
                console.log(`[ARDUINO] ✓ Notification envoyée avec succès`);
            }).catch(err => {
                console.error('[ARDUINO] ✗ Erreur notification:', err);
            });

            res.status(200).send(`
                <root>
                    <buzz>1</buzz>
                    <ledg>20,0,1</ledg>
                    <open>1</open>
                    <releaseId>1</releaseId>
                </root>
            `);

        } else {
            // ❌ ACCÈS REFUSÉ (Badge non trouvé en BDD)
            // PAS DE NOTIFICATION ARDUINO pour les badges inconnus
            console.log(`[ACCES REFUSÉ] Badge inconnu : ${cardId} - Pas de notification Arduino`);
           
            res.status(401).send(`
                <root>
                    <buzz>2</buzz>
                    <ledr>10,5,2</ledr>
                    <releaseId>1</releaseId>
                </root>
            `);
        }

    } catch (error) {
        console.error('[ERREUR BDD] Problème de connexion ou de requête :', error);
        
        // ❌ PAS DE NOTIFICATION ARDUINO pour les erreurs système
        
        res.status(500).send('<root><buzz>3</buzz><ledr>10,5,3</ledr></root>');
    }
});

module.exports = router;