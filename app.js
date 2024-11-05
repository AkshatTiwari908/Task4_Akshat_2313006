const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');  
const app = express();

// Configuration and Constants
const JWT_SECRET = "A!f4G7$2b6d9R1v&zL^pN3k%qY*wT";
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
mongoose.connect('mongodb://localhost:27017/notesDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Failed to connect to MongoDB", err));

// Schemas and Models
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const noteSchema = new mongoose.Schema({
    title: String,
    content: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const User = mongoose.model('User', userSchema);
const Note = mongoose.model('Note', noteSchema);

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied' });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

// User Registration Route
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({ username, password: hashedPassword });
        res.status(201).json({ message: 'User created successfully', userId: newUser._id });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ message: 'Username already exists' });
        } else {
            res.status(500).json({ message: 'Server error during registration' });
        }
    }
});
// User Login Route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        console.log('Login attempt:', { username, password }); // Debug log

        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found'); // Debug log
            return res.status(400).json({ message: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('Invalid credentials'); // Debug log
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        console.log('Login successful, token issued'); // Debug log
        res.json({ token });
    } catch (err) {
        console.error('Error during login:', err); // Error log
        res.status(500).json({ message: 'Server error during login' });
    }
});

// Fetch Notes Route
app.get('/api/notes', authenticateToken, async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user.userId });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching notes' });
    }
});

// Add Note Route
app.post('/api/notes', authenticateToken, async (req, res) => {
    const { title, content } = req.body;
    try {
        const newNote = await Note.create({
            title,
            content,
            userId: req.user.userId,
        });
        res.status(201).json(newNote);
    } catch (err) {
        res.status(500).json({ message: 'Error creating note' });
    }
});

// Update Note Route
app.put('/api/notes/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    try {
        const updatedNote = await Note.findOneAndUpdate(
            { _id: id, userId: req.user.userId },
            { title, content },
            { new: true }
        );
        if (!updatedNote) return res.status(404).json({ message: 'Note not found' });
        res.json(updatedNote);
    } catch (err) {
        res.status(500).json({ message: 'Error updating note' });
    }
});

// Delete Note Route
app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedNote = await Note.findOneAndDelete({ _id: id, userId: req.user.userId });
        if (!deletedNote) return res.status(404).json({ message: 'Note not found' });
        res.json({ message: 'Note deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting note' });
    }
});

// Serve Frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
