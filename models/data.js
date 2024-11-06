const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://akshattiwari487:RMZBaJUhdYPa22Lg@cluster0.uzydo.mongodb.net/notesDB?retryWrites=true&w=majority', {
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Failed to connect to MongoDB", err));

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

module.exports = {User,Note}