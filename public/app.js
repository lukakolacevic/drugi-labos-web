// Initialize vulnerability toggles
let vulnerabilities = {
    xss: true,
    brokenAccessControl: true
};

// Load vulnerability states on page load
async function loadVulnerabilityStates() {
    try {
        const response = await fetch('/api/vulnerabilities');
        vulnerabilities = await response.json();
        
        document.getElementById('xss-toggle').checked = vulnerabilities.xss;
        document.getElementById('bac-toggle').checked = vulnerabilities.brokenAccessControl;
    } catch (error) {
        console.error('Error loading vulnerability states:', error);
    }
}

// Toggle vulnerability
async function toggleVulnerability(type) {
    try {
        const response = await fetch('/api/vulnerabilities/toggle', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type })
        });
        
        const data = await response.json();
        if (data.success) {
            vulnerabilities[type] = data[type];
            const status = data[type] ? 'uključena' : 'isključena';
            alert(`Ranjivost ${type} je sada ${status}`);
            
            // Reload messages if XSS vulnerability was toggled
            if (type === 'xss') {
                loadMessages();
            }
        }
    } catch (error) {
        console.error('Error toggling vulnerability:', error);
    }
}

// XSS Functions
async function addMessage() {
    const author = document.getElementById('author').value;
    const message = document.getElementById('message').value;

    if (!author || !message) {
        alert('Molimo unesite autora i poruku');
        return;
    }

    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ author, message })
        });

        const data = await response.json();
        if (data.success) {
            document.getElementById('message').value = '';
            loadMessages();
        }
    } catch (error) {
        console.error('Error adding message:', error);
    }
}

async function loadMessages() {
    try {
        const response = await fetch('/api/messages');
        const messages = await response.json();
        
        // Get current vulnerability state
        const vulnResponse = await fetch('/api/vulnerabilities');
        const currentVulns = await vulnResponse.json();
        
        const messagesList = document.getElementById('messages-list');
        
        if (messages.length === 0) {
            messagesList.innerHTML = '<div class="empty-state">Nema poruka. Dodajte prvu poruku!</div>';
            return;
        }

        // Helper function to escape HTML
        function escapeHtml(text) {
            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return text.replace(/[&<>"']/g, m => map[m]);
        }

        messagesList.innerHTML = messages.map(msg => {
            // If XSS vulnerability is OFF, escape the message content
            const displayMessage = currentVulns.xss ? msg.message : escapeHtml(msg.message);
            const displayAuthor = currentVulns.xss ? msg.author : escapeHtml(msg.author);
            
            return `
                <div class="message-item">
                    <div class="message-header">
                        <span>${displayAuthor}</span>
                        <span>${new Date(msg.timestamp).toLocaleString('hr-HR')}</span>
                    </div>
                    <div class="message-content">${displayMessage || '(Empty message)'}</div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading messages:', error);
    }
}

// Broken Access Control Functions
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');

    if (!username || !password) {
        errorDiv.textContent = 'Molimo unesite korisničko ime i lozinku';
        errorDiv.classList.add('show');
        return;
    }

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (data.success) {
            errorDiv.classList.remove('show');
            loadUserInfo();
        } else {
            errorDiv.textContent = data.error || 'Neispravno korisničko ime ili lozinka';
            errorDiv.classList.add('show');
        }
    } catch (error) {
        console.error('Error logging in:', error);
        errorDiv.textContent = 'Greška pri prijavi';
        errorDiv.classList.add('show');
    }
}

async function logout() {
    try {
        await fetch('/api/auth/logout', {
            method: 'POST'
        });
        
        document.getElementById('login-form').style.display = 'block';
        document.getElementById('user-info').style.display = 'none';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('admin-result').innerHTML = '';
    } catch (error) {
        console.error('Error logging out:', error);
    }
}

async function loadUserInfo() {
    try {
        const response = await fetch('/api/auth/current');
        const data = await response.json();
        
        if (data.authenticated) {
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('user-info').style.display = 'block';
            
            document.getElementById('user-details').innerHTML = `
                <p><strong>Korisničko ime:</strong> ${data.user.username}</p>
                <p><strong>Uloga:</strong> ${data.user.role}</p>
                <p><strong>Email:</strong> ${data.user.email}</p>
            `;
        } else {
            document.getElementById('login-form').style.display = 'block';
            document.getElementById('user-info').style.display = 'none';
        }
    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

async function loadAdminUsers() {
    const resultDiv = document.getElementById('admin-result');
    resultDiv.innerHTML = '<p>Učitavanje...</p>';

    try {
        const response = await fetch('/api/admin/users');
        const data = await response.json();
        
        if (data.success) {
            resultDiv.innerHTML = `
                <div class="success-message">✓ Uspješno učitano! Pristup dozvoljen.</div>
                <div class="user-list">
                    <h4>Lista korisnika:</h4>
                    ${data.users.map(user => `
                        <div class="user-card">
                            <h4>${user.username}</h4>
                            <p><strong>ID:</strong> ${user.id}</p>
                            <p><strong>Uloga:</strong> ${user.role}</p>
                            <p><strong>Email:</strong> ${user.email}</p>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            resultDiv.innerHTML = `
                <div class="error-message show">✗ ${data.error}</div>
            `;
        }
    } catch (error) {
        console.error('Error loading admin users:', error);
        resultDiv.innerHTML = `
            <div class="error-message show">Greška pri učitavanju korisnika</div>
        `;
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadVulnerabilityStates();
    loadMessages();
    loadUserInfo();

    // XSS toggle
    document.getElementById('xss-toggle').addEventListener('change', (e) => {
        toggleVulnerability('xss');
    });

    // Broken Access Control toggle
    document.getElementById('bac-toggle').addEventListener('change', (e) => {
        toggleVulnerability('brokenAccessControl');
    });
});

