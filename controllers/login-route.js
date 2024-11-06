const express = require('express')
const lrRoute = express.Router()
const bcrypt = require('bcryptjs');
const {User,Note}= require('../models/data')
const jwt = require('jsonwebtoken');
const JWT_SECRET = "A!f4G7$2b6d9R1v&zL^pN3k%qY*wT";

lrRoute.post('/api/r/register', async (req, res) => {
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
lrRoute.post('/api/r/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        console.log('Login attempt:', { username, password }); 

        const user = await User.findOne({ username });
        if (!user) {
            console.log('User not found'); 
            return res.status(400).json({ message: 'User not found' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            console.log('Invalid credentials');
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
        console.log('Login successful, token issued'); 
        res.json({ token });
    } catch (err) {
        console.error('Error during login:', err); 
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = lrRoute;