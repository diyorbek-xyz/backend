function response({ req, res, render, name, layout = 'main', data = {}, redirect }) {
	if (req.xhr || req.headers.accept.includes('application/json')) {
		res.json(data);
	} else if (redirect) {
		res.redirect(redirect);
	} else {
		res.render(render, { layout, [name]: data, user: req.user });
	}
}

module.exports = response;
