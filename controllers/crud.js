const express = require('express')
const crudRoute = express.Router()
const {User,Note}= require('../models/data')
const authenticateToken = require('../middlewares/authenticate')

crudRoute.get('/', authenticateToken, async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.user.userId });
        res.json(notes);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching notes' });
    }
});

// Add Note Route
crudRoute.post('/', authenticateToken, async (req, res) => {
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
crudRoute.put('/:id', authenticateToken, async (req, res) => {
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
crudRoute.delete('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const deletedNote = await Note.findOneAndDelete({ _id: id, userId: req.user.userId });
        if (!deletedNote) return res.status(404).json({ message: 'Note not found' });
        res.json({ message: 'Note deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting note' });
    }
});
module.exports = crudRoute