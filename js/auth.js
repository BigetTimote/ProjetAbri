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

async function fetchUsers() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`${API_URL}/api/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await res.json();
        const tbody = document.getElementById('users-list');
        if (!tbody) return;

        tbody.innerHTML = '';
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td style="padding:8px; border:1px solid #ddd;">${user.nom}</td>
                <td style="padding:8px; border:1px solid #ddd;">${user.prenom}</td>
                <td style="padding:8px; border:1px solid #ddd; font-family: monospace;">${user.badge_uid}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Erreur chargement utilisateurs :", err);
    }
}
// --- ÉVÉNEMENTS ---

window.onload = () => {
    
    initUI();

    // DÉLÉGATION DE CLIC UNIQUE
    document.addEventListener('click', (e) => {
        // On cherche si l'élément cliqué est le bouton déconnexion
        if (e.target && e.target.classList.contains('btn-logout')) {
            e.preventDefault();
            console.log("3. CLIC DÉTECTÉ SUR LE BOUTON LOGOUT");
            logout();
        }

        // Gestion du bouton login (si présent)
        if (e.target.id === 'btn-login') {
            e.preventDefault();
            login();
        }
    });

    // Basculement de formulaires
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
        
        // On lance la récupération des deux tables
        fetchBoxes(); 
        fetchUsers(); 
    } else {
        document.getElementById('user-dashboard').classList.remove('hidden');
        document.getElementById('user-name').innerText = payload.username;
        // fetchSolde(); 
    }
}
async function fetchBoxes() {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`/api/boxes`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const boxes = await res.json();

        const tbody = document.getElementById('boxes-list');
        if (!tbody) {
            console.error("Erreur : l'élément #boxes-list est introuvable dans le HTML");
            return;
        }

        tbody.innerHTML = ''; // On vide le tableau avant de le remplir

        boxes.forEach(box => {
            const tr = document.createElement('tr');
            // Couleur : Vert pour LIBRE, Rouge pour le reste
            const statusColor = box.etat === 'LIBRE' ? 'green' : 'red';
            
            tr.innerHTML = `
                <td style="padding:8px; border:1px solid #ddd;">${box.numero}</td>
                <td style="padding:8px; border:1px solid #ddd; color:${statusColor}; font-weight:bold;">${box.etat}</td>
                <td style="padding:8px; border:1px solid #ddd;">${box.user_id_actuel || '<i>Aucun</i>'}</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error("Erreur lors du chargement des boxes :", err);
    }
}
async function logout() {
    console.log("Exécution de la fonction logout...");
    try {
        await fetch(`${API_URL}/logout`, { method: 'POST' });
    } catch (err) {
        console.warn("Erreur route logout (pas grave) :", err);
    } finally {
        localStorage.removeItem('token');
        console.log("Token supprimé, redirection...");
        window.location.href = 'index.html'; // Force le retour à l'accueil
    }
}