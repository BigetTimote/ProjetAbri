const cron = require('node-cron');
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

const initResetJob = () => {
    // 0 2 * * 1 = Lundi à 02:00
    cron.schedule('0 2 * * 1', () => {
        console.log('Exécution du reset hebdomadaire...');
        const sql = "UPDATE users SET credit_temps = 1500";
        db.query(sql, (err, result) => {
            if (err) console.error('Erreur reset:', err);
            else console.log('Crédits réinitialisés à 1500 min');
        });
    }, { timezone: "Europe/Paris" });
};

module.exports = initResetJob;