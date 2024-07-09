const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const db = new sqlite3.Database('./db/database.db');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

require('dotenv').config();

// Session setup
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Middleware to check if user is authenticated
const authMiddleware = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
};

// Routes
app.get('/', (req, res) => {
    res.redirect('/items');
});

// Login route - GET request to render login form
app.get('/login', (req, res) => {
    res.render('login'); // Assuming you have a login.ejs file in your views folder
});

// Login route - POST request to handle form submission
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === process.env.AUTH_USERNAME && password === process.env.AUTH_PASSWORD) {
        req.session.loggedIn = true;
        res.redirect('/items');
    } else {
        res.redirect('/login');
    }
});

// Protected route example - requires authentication
app.get('/items', authMiddleware, (req, res) => {
    // Here you can fetch data from your SQLite database
    db.all('SELECT * FROM items', (err, rows) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.render('items', { items: rows }); // Assuming you have an items.ejs file in your views folder
    });
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
            return;
        }
        res.redirect('/login');
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
