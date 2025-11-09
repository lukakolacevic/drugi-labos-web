const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(session({
  secret: 'insecure-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Serve static files
app.use(express.static('public'));

// In-memory data storage
let messages = [];
let users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', email: 'admin@example.com' },
  { id: 2, username: 'user', password: 'user123', role: 'user', email: 'user@example.com' }
];

// Vulnerability toggles
let vulnerabilities = {
  xss: true,
  brokenAccessControl: true
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Get vulnerability status
app.get('/api/vulnerabilities', (req, res) => {
  res.json(vulnerabilities);
});

// Toggle vulnerabilities
app.post('/api/vulnerabilities/toggle', (req, res) => {
  const { type } = req.body;
  if (vulnerabilities.hasOwnProperty(type)) {
    vulnerabilities[type] = !vulnerabilities[type];
    res.json({ success: true, [type]: vulnerabilities[type] });
  } else {
    res.status(400).json({ success: false, error: 'Invalid vulnerability type' });
  }
});

// XSS Vulnerability Routes
app.get('/api/messages', (req, res) => {
  res.json(messages);
});

app.post('/api/messages', (req, res) => {
  const { message, author } = req.body;
  
  if (!message || !author) {
    return res.status(400).json({ error: 'Message and author are required' });
  }

  const newMessage = {
    id: messages.length + 1,
    message: vulnerabilities.xss ? message : escapeHtml(message), // XSS vulnerability: no sanitization when enabled
    author: vulnerabilities.xss ? author : escapeHtml(author),
    timestamp: new Date().toISOString()
  };

  messages.push(newMessage);
  res.json({ success: true, message: newMessage });
});

// Broken Access Control Routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
  } else {
    res.status(401).json({ success: false, error: 'Invalid credentials' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/auth/current', (req, res) => {
  if (req.session.userId) {
    const user = users.find(u => u.id === req.session.userId);
    res.json({ 
      authenticated: true, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role,
        email: user.email 
      } 
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Broken Access Control: Admin-only route
app.get('/api/admin/users', (req, res) => {
  // Broken Access Control: When vulnerability is enabled, no proper authorization check
  if (vulnerabilities.brokenAccessControl) {
    // Vulnerable: Only checks if user is logged in, not if they're admin
    if (req.session.userId) {
      res.json({ success: true, users: users.map(u => ({ 
        id: u.id, 
        username: u.username, 
        role: u.role, 
        email: u.email 
      })) });
    } else {
      res.status(401).json({ success: false, error: 'Not authenticated' });
    }
  } else {
    // Secure: Proper authorization check
    if (req.session.userId && req.session.role === 'admin') {
      res.json({ success: true, users: users.map(u => ({ 
        id: u.id, 
        username: u.username, 
        role: u.role, 
        email: u.email 
      })) });
    } else {
      res.status(403).json({ success: false, error: 'Access denied. Admin role required.' });
    }
  }
});

// Helper function to escape HTML (for when XSS is disabled)
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

