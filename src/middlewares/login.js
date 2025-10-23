const jwt = require('jsonwebtoken');
const LoginModel = require('../models/login');

const verifyToken = async (req, res, next) => {
	const token = req.headers.authorization?.split(' ')[1];
	if (!token) return res.status(401).json({ error: 'Token required' });
	

	try {
		const user = await jwt.verify(token, process.env.SECRET); // { id, role }
		
		const data = await LoginModel.find({ _id: user.id });
		if (!data[0]) return res.status(401).json({ error: 'User Not Found' });		
		
		req.user = user;
		next();
	} catch (err) {
		res.status(401).json({ error: 'Token invalid' });
	}
};

const permit = (...allowedRoles) => {
	return (req, res, next) => {
		if (!req.user) return res.status(401).json({ error: 'User not authenticated' });
		if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ error: 'Access denied' });
		next();
	};
};

module.exports = { verifyToken, permit };
