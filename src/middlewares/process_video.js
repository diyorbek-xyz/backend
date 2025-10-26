/** @format */

const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const sharp = require('sharp');

function ensureDir(dir) {
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function toTimecode(sec) {
	const h = String(Math.floor(sec / 3600)).padStart(2, '0');
	const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0');
	const s = String(Math.floor(sec % 60)).padStart(2, '0');
	return `${h}:${m}:${s}.000`;
}

async function processVideo(req, res, next) {
	console.log('Starting process video...');
	const inputPath = req.files.file[0].path;
	const outputDir = path.join('uploads', 'animes', req.body.name.toString(), req.body.season.toString(), req.body.episode.toString());
	
	ensureDir(outputDir);

	// 1. Multi-resolution HLS
	ensureDir(path.join(outputDir, 'datas'));
	await new Promise((resolve, reject) => {
		ffmpeg(inputPath)
			.outputOptions([
				'-filter_complex',
				'[0:v]split=3[v1][v2][v3]; [v1]scale=w=-2:h=360[v1out]; [v2]scale=w=-2:h=720[v2out]; [v3]scale=w=-2:h=1080[v3out]',

				'-map',
				'[v1out]',
				'-map',
				'0:a',
				'-c:v:0',
				'libx264',
				'-b:v:0',
				'800k',
				'-maxrate:v:0',
				'856k',
				'-bufsize:v:0',
				'1200k',
				'-c:a:0',
				'aac',
				'-b:a:0',
				'96k',
				'-hls_base_url',
				'datas/',
				'-hls_segment_filename',
				`${outputDir}/datas/data%v_%02d.ts`,

				'-map',
				'[v2out]',
				'-map',
				'0:a',
				'-c:v:1',
				'libx264',
				'-b:v:1',
				'2500k',
				'-maxrate:v:1',
				'2675k',
				'-bufsize:v:1',
				'3750k',
				'-c:a:1',
				'aac',
				'-b:a:1',
				'128k',
				'-hls_base_url',
				'datas/',
				'-hls_segment_filename',
				`${outputDir}/datas/data%v_%02d.ts`,

				'-map',
				'[v3out]',
				'-map',
				'0:a',
				'-c:v:2',
				'libx264',
				'-b:v:2',
				'5000k',
				'-maxrate:v:2',
				'5350k',
				'-bufsize:v:2',
				'7500k',
				'-c:a:2',
				'aac',
				'-b:a:2',
				'192k',
				'-hls_base_url',
				'datas/',
				'-hls_segment_filename',
				`${outputDir}/datas/data%v_%02d.ts`,

				'-f',
				'hls',
				'-hls_time',
				'5',
				'-hls_list_size',
				'0',
				'-hls_flags',
				'independent_segments',
				'-master_pl_name',
				`master.m3u8`,

				'-var_stream_map',
				'v:0,a:0 v:1,a:1 v:2,a:2',
			])
			.output(`${outputDir}/%v.m3u8`)
			.on('start', () => console.log('Making video resolutions...'))
			.on('progress', (progress) => console.log('Processing: ' + progress.percent.toFixed(2) + '% done'))
			.on('error', (err, stdout, stderr) => (console.error('FFmpeg Error: ' + err.message), res.status(500).json({ error: 'FFmpeg Error: ' + err.message }), reject(err)))
			.on('end', () => (console.log('Making video resolutions finished.'), resolve(`${outputDir}/master.m3u8`)))
			.run();
	});

	console.info('Making previews...');

	const previewsDir = path.join(outputDir, 'previews');
	
	ensureDir(previewsDir);
	await new Promise((resolve, reject) => ffmpeg(inputPath).output(`${previewsDir}/thumb-%04d.png`).outputOptions(['-vf', 'fps=1/10,scale=-2:80']).on('end', resolve).on('error', reject).run());
	const previewFiles = fs
		.readdirSync(previewsDir)
		.filter((f) => f.endsWith('.png'))
		.sort();
	let previewsVtt = 'WEBVTT\n\n';
	previewFiles.forEach((file, i) => {
		const start = toTimecode(i * 10);
		const end = toTimecode((i + 1) * 10);
		previewsVtt += `${start} --> ${end}\n${outputDir}/previews/${file}\n\n`;
	});
	fs.writeFileSync(path.join(outputDir, 'previews.vtt'), previewsVtt);

	console.info('Making previews finished.');
	const downloadName = req.body.name.toString() + '_' + req.body.season.toString() + '_' + req.body.episode.toString() + path.extname(inputPath);
	const downloadPath = path.join(outputDir, downloadName);
	await fs.renameSync(inputPath, downloadPath);

	req.data.files = {
		video: `${outputDir}/master.m3u8`,
		previews: `${outputDir}/previews.vtt`,
		download: downloadPath,
	};
	console.log('Process video ended');
	next();
}
module.exports = processVideo;
