const cron = require('node-cron');
module.exports = () => {
    cron.schedule('0 2 * * 1', () => { 
        console.log("Reset hebdo programmé"); 
    }, { timezone: "Europe/Paris" });
};