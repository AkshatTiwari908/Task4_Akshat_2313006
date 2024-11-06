const express = require('express');
const path = require('path');  
const app = express();
const lrRoute = require('./controllers/login-route');
const crudRoute = require('./controllers/crud');

// Configuration and Constants
const PORT = 3000;


const cors = require('cors');
app.use(cors({
  origin: 'https://notesnest-28lc.onrender.com/',
}));
// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/',lrRoute)
app.use('/api/notes',crudRoute)

// Serve Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
