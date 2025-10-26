/** @format */

const { Router } = require('express');
const upload = require('../middlewares/upload');
const queries = require('../middlewares/queries');
const { AnimeModel } = require('../models/anime');
const addPoster = require('../middlewares/add_poster');
const processVideo = require('../middlewares/process_video');
const { verifyToken, permit } = require('../middlewares/login');
const response = require('../utils/response');

const router = Router();

router.get('/', verifyToken, queries, async (req, res) => {
	if (req.queries.anime) {
		const anime = await AnimeModel.findOne({ anime: req.queries.anime });
		const season = req.queries.season && anime.seasons.find((s) => s.season == req.queries.season);
		const episode = req.queries.episode && season.episodes.find((e) => e.episode == req.queries.episode);

		let data;
		if (anime) data = anime;
		if (season) data = { poster: anime.poster, ...season.toJSON() };
		if (episode) data = { poster: anime.poster, ...episode.toJSON() };

		res.json(data);
	} else {
		const data = await AnimeModel.find().lean();
		response({ req, res, data, render: 'animes/animes', name: 'animes' });
	}
});

router.post(
	'/',
	upload.fields([
		{ name: 'file', maxCount: 1 },
		{ name: 'poster', maxCount: 1 },
	]),
	addPoster,
	processVideo,
	async (req, res) => {
		console.info('Adding episode...');
		let collection = await AnimeModel.findOne({ anime: req.body.name });
		const poster = req.data.poster;

		if (!collection) {
			collection = new AnimeModel({
				anime: req.body.name,
				poster: poster,
				link: req.body.link,
				studio: req.body.studio,
				seasons: [],
			});
		}

		const seasonNumber = parseInt(req.body.season);
		const episodeNumber = parseInt(req.body.episode);
		const exist = collection.seasons.find((s) => s.season === seasonNumber);
		let season = exist;

		if (!season) season = { title: `${seasonNumber} Fasl`, season: seasonNumber, episodes: [] };

		let episode = season.episodes.find((e) => e.episode === episodeNumber);

		if (!episode) {
			episode = {
				title: `${episodeNumber}-qism`,
				episode: episodeNumber,
				video: req.data.files.video,
				previews: req.data.files.previews,
				download: req.data.files.download,
			};
			season.episodes.push(episode);
			if (!exist) collection.seasons.push(season);
		}

		await collection.save();
		console.info('Adding episode finished.');

		res.send(collection);
	}
);

router.put('/', (req, res) => {});
router.delete('/', (req, res) => {});

module.exports = router;
