/** @format */

const { Router } = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const LoginModel = require('../models/login');
const { verifyToken } = require('../middlewares/login');
const upload = require('../middlewares/upload');
const { AnimeModel } = require('../models/anime');

const router = Router();

router.get('/accounts', verifyToken, async (req, res) => {
	try {
		const { username } = req.query;
		const data = await LoginModel.find(username ? { username: username.toLowerCase() } : {});
		res.json(data);
	} catch (err) {
		res.status(404).json({ message: 'Error', err });
	}
});

router.post('/signup', async (req, res) => {
	const { username, password, role, first_name, last_name } = req.body;
	const hashed = await bcrypt.hash(password, 10);
	const exist = await LoginModel.findOne({ username: username.toLowerCase() });

	if (!exist) {
		const user = await LoginModel.create({ username: username.toLowerCase(), password: hashed, role, first_name, last_name });
		const token = jwt.sign({ id: user._id, role: user.role }, process.env.SECRET);
		res.json({ token, user });
	} else {
		res.status(409).json({ message: 'This username already taken' });
	}
});

router.post('/login', async (req, res) => {
	const { username, password } = req.body;
	const user = await LoginModel.findOne({ username: username.toLowerCase() });
	if (!user) return res.status(404).json({ message: 'User Not Found' });

	const match = await bcrypt.compare(password, user.password);
	if (!match) return res.status(401).json({ message: 'Wrong passwod' });

	const token = jwt.sign({ id: user._id, role: user.role }, process.env.SECRET);
	res.json({ token, user });
});

router.get('/me', verifyToken, async (req, res) => {
	const user = await LoginModel.findById(req.user.id).select('-password -__v -role -_id');
	res.json(user);
});

router.put(
	'/me/:id',
	verifyToken,
	upload.fields([
		{ name: 'avatar', maxCount: 1 },
		{ name: 'banner', maxCount: 1 },
	]),
	async (req, res) => {
		const props = req.body;
		const avatar = req.files?.avatar?.[0]?.path;
		const banner = req.files?.banner?.[0]?.path;

		const id = req.user.id || req.params.id;

		const user = await LoginModel.findByIdAndUpdate(id, { avatar, banner, ...props }, { new: true });
		if (!user) return res.status(404).json({ message: 'User Not Found' });
	},
);

module.exports = router;
