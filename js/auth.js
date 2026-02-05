const API_URL = 'http://172.29.16.155:3000';

// Conversion Minutes en HH:MM
function formatTime(totalMinutes) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
}

async function fetchSolde() {
    const token = localStorage.getItem('token');
    if (!token) return logout();

    try {
        const res = await fetch(`${API_URL}/api/solde`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (res.ok) {
            document.getElementById('user-time').innerText = formatTime(data.credit);
            document.getElementById('user-name').innerText = data.nom;
        } else {
            logout();
        }
    } catch (err) { console.error(err); }
}

async function login() {
    const username = document.getElementById('login-user').value;
    const password = document.getElementById('login-pass').value;

    const res = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', username);
        initUI();
    } else { alert(data.error); }
}

function initUI() {
    const token = localStorage.getItem('token');
    if (token) {
        document.getElementById('auth-forms').classList.add('hidden');
        document.getElementById('user-dashboard').classList.remove('hidden');
        fetchSolde();
    }
}

function logout() {
    localStorage.clear();
    location.reload();
}

document.getElementById('btn-login').addEventListener('click', login);
document.getElementById('btn-logout').addEventListener('click', logout);
document.getElementById('btn-refresh').addEventListener('click', fetchSolde);
window.onload = initUI;