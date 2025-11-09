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
  cookie: { 
    secure: false,
    httpOnly: false  // Allow JavaScript access to cookie for XSS demonstration
  }
}));


app.use(express.static('public'));

let messages = [];
let users = [
  { id: 1, username: 'admin', password: 'admin123', role: 'admin', email: 'admin@example.com' },
  { id: 2, username: 'user', password: 'user123', role: 'user', email: 'user@example.com' },
  { id: 3, username: 'marko', password: 'marko123', role: 'user', email: 'marko@example.com' },
  { id: 4, username: 'ana', password: 'ana123', role: 'user', email: 'ana@example.com' },
  { id: 5, username: 'petar', password: 'petar123', role: 'user', email: 'petar@example.com' },
  { id: 6, username: 'marija', password: 'marija123', role: 'user', email: 'marija@example.com' },
  { id: 7, username: 'ivan', password: 'ivan123', role: 'user', email: 'ivan@example.com' }
];

let vulnerabilities = {
  xss: true,
  brokenAccessControl: true
};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/vulnerabilities', (req, res) => {
  res.json(vulnerabilities);
});

app.post('/api/vulnerabilities/toggle', (req, res) => {
  const { type } = req.body;
  if (vulnerabilities.hasOwnProperty(type)) {
    vulnerabilities[type] = !vulnerabilities[type];
    res.json({ success: true, [type]: vulnerabilities[type] });
  } else {
    res.status(400).json({ success: false, error: 'Invalid vulnerability type' });
  }
});

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

app.get('/api/admin/users', (req, res) => {
  if (vulnerabilities.brokenAccessControl) {
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

