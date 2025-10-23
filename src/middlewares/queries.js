/** @format */

const queries = async (req, res, next) => {
	req.queries = {};
	if (req.query.id) req.queries._id = req.query.id;
	if (req.query.name) req.queries.anime = req.query.name;
	if (req.query.season) req.queries.season = req.query.season;
	if (req.query.episode) req.queries.episode = req.query.episode;
	if (req.query.username) req.queries.username = req.query.username;
	next();
};

module.exports = queries;
