const jwt = require('jsonwebtoken')
const SECRET_KEY = process.env.SECRET_KEY

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
        return next()
    }

    try {
        const token = req.headers.authorization?.split(' ')[1]

        if (!token) {
            return res.status(401).json({message: 'Authorization token required'});
        }

        const decoded = jwt.verify(token, SECRET_KEY)
        req.user = decoded
        next()
    } catch (error) {
        console.error('Unexpected error during authentication:', error);
        const errorMessage = 'Internal server error';
        res.status(401).json({message: errorMessage});
    }
}
