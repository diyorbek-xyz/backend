/** @format */

require('dotenv').config();
const { default: chalk } = require('chalk');
const { default: mongoose } = require('mongoose');
const express = require('express');
const app = express();
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', require('./src/routes/login'));
app.use('/api/animes', require('./src/routes/anime'));
app.use(
	'/uploads',
	express.static('uploads', {
		setHeaders: (res, path) => {
			if (path.endsWith('.vtt')) {
				res.setHeader('Content-Type', 'text/vtt');
			}
		},
	}),
);

mongoose
	.connect(MONGO_URL)
	.then(() => (console.clear(), console.log(chalk.blue('Databazaga Ulandi')), app.listen(PORT, () => (console.log(chalk.greenBright('Server ishladi ') + chalk.hex('#00d9ff')(`http://localhost:${PORT}`)), console.log(chalk.bold(chalk.green('Hammasi Joyida!')))))))
	.catch((err) => (console.clear(), console.log(chalk.yellow('IDIOT!: ') + chalk.red(err))));
