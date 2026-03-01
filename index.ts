import cookieParser from 'cookie-parser';
import path from 'path';
import cors from 'cors';
import chalk from 'chalk';
import mongoose from 'mongoose';
import methodOverride from 'method-override';
import express from 'express';
import dotenv from 'dotenv';
import { routes } from './src/routes';
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) ?? 5588;
const MONGO_URL = process.env.MONGO_URL ?? '';

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(methodOverride('_method'));
app.use(cookieParser());

app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(process.cwd(), 'public')));

app.use('/', routes);


mongoose
	.connect(MONGO_URL)
	.then(() => {
		console.clear();
		console.log(chalk.blue('Databazaga Ulandi'));
		app.listen(PORT, '0.0.0.0', (e: any) => {
			console.log(chalk.greenBright('Server ishladi ') + chalk.hex('#00d9ff')(`http://localhost:${PORT}`));
			console.log(chalk.bold(chalk.green('Hammasi Joyida!')));
		});
	})
	.catch((err: any) => {
		console.clear();
		console.log(chalk.yellow('IDIOT!: ') + chalk.red(err));
	});
