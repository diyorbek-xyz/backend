/** @format */

const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

async function addPoster(req, res, next) {
	console.log('Poster adding...');
	const file = req.files.poster[0];
	const newDir = path.join('uploads', 'animes', req.body.name, req.body.season.toString());
	const poster = path.join(newDir, 'poster.png');
	await fs.mkdir(newDir, { recursive: true });

	const metadata = `<x:xmpmeta xmlns:x="adobe:ns:meta/">
							<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
								<rdf:Description xmlns:dc="http://purl.org/dc/elements/1.1/">
									<dc:anime>${req.body.name}</dc:anime>
									<dc:creator>Diyorbek</dc:creator>
									<dc:telegram>@diyorbek-xyz</dc:telegram>
									<dc:website>https://amediatv.uz</dc:website>
								</rdf:Description>
							</rdf:RDF>
						</x:xmpmeta>`;

	console.info('Starting poster compression!');
	await sharp(file.path)
		.resize({
			width: 854,
			height: 480,
			fit: 'cover',
			position: 'center',
		})
		.withXmp(metadata)
		.toFormat('png', { compression: 'hevc', compressionLevel: 5, quality: 85, alphaQuality: 80, preset: 'drawing' })
		.toFile(poster)
		.then(() => console.info('Poster compression completed!'));

	await fs.unlink(file.path);

	req.data = { poster };

	console.log('Poster added!');
	next();
}
module.exports = addPoster;
