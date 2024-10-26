const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');  // Import path for resolving file paths

const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost:27017/notesDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const noteSchema = new mongoose.Schema({
    title: String,
    content: String,
});
const Note = mongoose.model('Note', noteSchema);

// API Routes
app.get('/api/notes', async (req, res) => {
    const notes = await Note.find();
    res.json(notes);
});

app.post('/api/notes', async (req, res) => {
    const { title, content } = req.body;
    const newNote = new Note({
        title,
        content,
    });
    await newNote.save();
    res.json(newNote);
});

app.put('/api/notes/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;
    const updatedNote = await Note.findByIdAndUpdate(id, { title, content }, { new: true });
    res.json(updatedNote);
});

app.delete('/api/notes/:id', async (req, res) => {
    const { id } = req.params;
    await Note.findByIdAndDelete(id);
    res.json({ message: 'Note deleted successfully' });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
