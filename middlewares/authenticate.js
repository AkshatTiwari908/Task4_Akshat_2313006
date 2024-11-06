const jwt = require('jsonwebtoken');
const JWT_SECRET = "A!f4G7$2b6d9R1v&zL^pN3k%qY*wT";

function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Access denied' });
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}
module.exports= authenticateToken