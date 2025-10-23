/** @format */

const path = require('path');
const fs = require('fs');

async function addPoster(req, res, next) {
	console.log('Poster adding...');

	const file = req.files.poster[0];
	const newDir = path.join('uploads', 'animes', req.body.name, req.body.season.toString());
	const poster = path.join(newDir, 'poster' + path.extname(file.originalname));

	fs.mkdirSync(newDir, { recursive: true });
	fs.renameSync(file.path, poster);

	req.data = { poster };
	console.log('Poster added!');

	next();
}
module.exports = addPoster;
