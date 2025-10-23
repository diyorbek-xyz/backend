/** @format */

const { default: mongoose } = require('mongoose');
const processVideo = require('../middlewares/process_video');
const addPoster = require('../middlewares/add_poster');

const EpisodeSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		episode: { type: Number, required: true },
		video: { type: String, required: true },
		previews: { type: String, required: true },
		download: { type: String, required: true },
	},
	{ id: false, _id: false },
);

const SeasonSchema = new mongoose.Schema(
	{
		title: { type: String, required: true },
		season: { type: Number, required: true },
		episodes: { type: [EpisodeSchema], default: [] },
	},
	{ id: false, _id: false },
);

const AnimeSchema = new mongoose.Schema({
	link: String,
	studio: String,
	anime: { type: String, required: true },
	poster: { type: String, required: true },
	seasons: [SeasonSchema],
});

const AnimeModel = mongoose.model('anime', AnimeSchema);

async function addEpisode(req) {
	let collection = await AnimeModel.findOne({ anime: req.body.name });
	const poster = await addPoster(req.files.poster[0], req.body.name, req.body.season);

	if (!collection) {
		collection = new AnimeModel({ anime: req.body.name, link: req.body.link, studio: req.body.studio, file: [] });
	}

	const seasonNumber = parseInt(req.body.season);
	const episodeNumber = parseInt(req.body.episode);
	const exist = collection.file.find((s) => s.season === seasonNumber);
	let season = exist;

	if (!season) season = { title: `${seasonNumber} Fasl`, season: seasonNumber, folder: [], poster: poster };

	let episode = season.folder.find((e) => e.episode === episodeNumber);

	console.log('Starting to process video...');
	const { result } = await processVideo(req.files.file[0].path, req.body.name, seasonNumber, episodeNumber);
	console.log('Process video ended');

	if (!episode) {
		episode = { title: `${episodeNumber}-qism`, episode: episodeNumber, file: result };
		season.folder.push(episode);
		if (!exist) collection.file.push(season);
	}

	await collection.save();
	return collection;
}

module.exports = { AnimeModel, addEpisode };
