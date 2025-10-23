/** @format */

const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
	destination: 'uploads/',
	filename: (req, file, cb) => cb(null, crypto.randomUUID() + path.extname(file.originalname)),
});

const upload = multer({ storage });

module.exports = upload;
