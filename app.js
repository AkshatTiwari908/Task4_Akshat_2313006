const express = require('express');
const mongoose = require('mongoose');
const path = require('path');  
const app = express();
const lrRoute = require('./controllers/login-route');
const crudRoute = require('./controllers/crud');
// Configuration and Constants

const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
mongoose.connect('mongodb://localhost:27017/notesDB', {
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Failed to connect to MongoDB", err));


// User Registration Route
app.use('/',lrRoute)
app.use('/',crudRoute)

// Serve Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
