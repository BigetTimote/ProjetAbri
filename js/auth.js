// On force le port 3000 pour parler directement à Node et ignorer Apache
const API_URL = 'http://172.29.16.155:3000'; 

// --- UTILITAIRES ---

// Décode le JWT pour lire le nom et le rôle (Admin/User)
function getPayload(token) {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        return JSON.parse(window.atob(base64));
    } catch (e) {
        return null;
    }
}

// Transforme les minutes de la base en format HH:MM
function formatTime(totalMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h}:${m < 10 ? '0' + m : m}`;
}

// --- FONCTIONS API ---

async function register() {
    const nom = document.getElementById('reg-nom').value;
    const prenom = document.getElementById('reg-prenom').value;
    const password = document.getElementById('reg-pass').value;

    if (!nom || !password) return alert("Nom et mot de passe requis !");

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nom, prenom, password })
        });

        const data = await res.json();
        if (res.ok) {
            alert("Compte créé avec succès !");
            location.reload(); 
        } else {
            alert(data.error || "Erreur lors de l'inscription");
        }
    } catch (err) {
        alert("Le serveur Node ne répond pas sur le port 3000");
    }
}

async function login() {
    const username = document.getElementById('login-user').value;
    const password = document.getElementById('login-pass').value;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (res.ok && data.token) {
            localStorage.setItem('token', data.token);
            location.reload();
        } else {
            alert(data.error || "Identifiants incorrects");
        }
    } catch (err) {
        alert("Impossible de contacter le serveur sur le port 3000");
    }
}

async function fetchSolde() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/api/solde`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            document.getElementById('user-time').innerText = formatTime(data.credit);
            document.getElementById('user-name').innerText = data.nom;
        }
    } catch (err) {
        console.error("Erreur récupération solde");
    }
}

// --- INITIALISATION UI ---

function initUI() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const payload = getPayload(token);
    if (!payload) return;

    // Cache les formulaires
    document.getElementById('login-form').classList.add('hidden');
    const regForm = document.getElementById('register-form');
    if (regForm) regForm.classList.add('hidden');

    if (payload.admin === 1) {
        // Affiche le panel Admin
        document.getElementById('admin-dashboard').classList.remove('hidden');
        document.getElementById('admin-name').innerText = payload.username;
    } else {
        // Affiche le dashboard User
        document.getElementById('user-dashboard').classList.remove('hidden');
        document.getElementById('user-name').innerText = payload.username;
        fetchSolde();
    }
}

// --- ÉVÉNEMENTS ---

window.onload = () => {
    initUI();

    // Gestion des clics boutons
    document.getElementById('btn-login')?.addEventListener('click', login);
    document.getElementById('btn-register')?.addEventListener('click', register);

    // Basculement formulaires
    document.getElementById('to-reg')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('register-form').classList.remove('hidden');
    });

    document.getElementById('to-login')?.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');
    });

    // Déconnexion
    document.querySelectorAll('.btn-logout').forEach(btn => {
        btn.addEventListener('click', () => {
            localStorage.clear();
            location.reload();
        });
    });
};
// Connexion WebSocket (Port 3000)
function setupRealtime() {
    const socket = new WebSocket(`ws://${window.location.hostname}:3000`);

    socket.onopen = () => {
        console.log("Connecté au temps réel");
        socket.send("Hello Server!");
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'UPDATE_TIME') {
            console.log("Actualisation automatique...");
            fetchSolde(); // On appelle ta fonction existante pour mettre à jour l'affichage
        }
    };

    socket.onclose = () => {
        console.log("Déconnecté du temps réel, tentative de reconnexion...");
        setTimeout(setupRealtime, 5000); // Reconnexion auto
    };
}

// Modifier initUI pour lancer le WS
function initUI() {
    const token = localStorage.getItem('token');
    if (!token) return;

    const payload = getPayload(token);
    document.getElementById('login-form').classList.add('hidden');

    if (payload && payload.admin === 1) {
        document.getElementById('admin-dashboard').classList.remove('hidden');
        document.getElementById('admin-name').innerText = payload.username;
    } else {
        document.getElementById('user-dashboard').classList.remove('hidden');
        document.getElementById('user-name').innerText = payload.username;
        fetchSolde();
        setupRealtime(); // <-- ON LANCE LE WS ICI
    }
}