import fs from 'fs';
import { randomUUID as uuid } from 'crypto';
import { labToSRgb } from './dist/convert-lab-to-srgb.js';

class Writer {
	constructor() {
		this.css = [];
		this.html = [];
	}

	row(lab) {
		const id = uuid();

		const { color: sRGB, inGamut: inGamut } = labToSRgb(lab);
		const p3 = [];
		// const p3 = Lab_to_P3(lab);

		this.css.push(`
			.raw-${id} {
				background-color: lab(${lab[0]}% ${lab[1]} ${lab[2]});
			}

			.rgb-${id} {
				background-color: rgb(${Math.round(sRGB[0]*255)}, ${Math.round(sRGB[1]*255)}, ${Math.round(sRGB[2]*255)});
			}

			.display-p3-${id} {
				background-color: color(display-p3 ${p3[0]} ${p3[1]} ${p3[2]});
			}
		`);
		
		this.html.push(`
			<div class="swatch">
				<div class="raw-${id}" title="${inGamut ? 'in' : 'out'} : lab(${lab[0]}% ${lab[1]} ${lab[2]})"></div>
				<div class="rgb-${id}" title="${inGamut ? 'in' : 'out'} : rgb(${Math.round(sRGB[0]*255)}, ${Math.round(sRGB[1]*255)}, ${Math.round(sRGB[2]*255)})"></div>
				<!-- <div class="display-p3-${id}"></div> -->
				<!-- <div class="raw-${id}"></div> -->
			</div>
		`);

		if (this.html.length > 250) {
			console.log(`writing to file and clear buffers`);
			fs.writeFileSync('./lab.html', this.html.join(''), { flag: 'a+' });
			this.html = [];
		}

		if (this.css.length > 250) {
			fs.writeFileSync('./stylesheet-lab.css', this.css.join(''), { flag: 'a+' });
			this.css = [];
		}
	}

	start() {
		fs.writeFileSync('./lab.html', `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Color swatches</title>

	<link rel="stylesheet" href="stylesheet-lab.css">

	<style>
		html, body {
			background-color: rgb(127,127,127);
		}

		.swatch {
			display: flex;
			flex-direction: row;
			width: 400px;
			height: 50px;
			margin-bottom: 1px;
		}

		.swatch div {
			width: 100px;
			height: 50px;
		}

		.heading {
			background-color: rgb(127,127,127);
			display: flex;
			flex-direction: row;
			width: 400px;
			height: 50px;
			position: sticky;
			top: 0;
		}

		.heading div {
			border-left: 1px solid black;
			border-right: 1px solid black;
			width: 98px;
			padding-top: 16px;
			text-align: center;
		}
	</style>
</head>
<body>
		<div class="heading">
			<div>raw</div>
			<div>lab -> sRGB</div>
			<!-- <div>lab -> P3</div> -->
			<div>raw</div>
		</div>
	`);

		fs.writeFileSync('./stylesheet-lab.css', '');
	}

	end() {
		fs.writeFileSync('./stylesheet-lab.css', this.css.join(''), { flag: 'a+' });

		fs.writeFileSync('./lab.html', `
			${this.html.join('')}
	</body>
	</html>
		`, { flag: 'a+' });
	}
}

(async () => {
	const writer = new Writer();
	writer.start();
	// negative L
	writer.row([-(1/100), 20, 20])

	// Max value for A
	{
		let a = 128;
		for (let b = -128; b < 129; b += 10) {
			for (let l = 0; l < 101; l += 10) {
				writer.row([l, a, b]);
			}
		}
	}

	// Max value for B
	{
		let b = 128;
		for (let a = -128; a < 129; a += 10) {
			for (let l = 0; l < 101; l += 10) {
				writer.row([l, a, b]);
			}
		}
	}

	// Max value for L
	{
		let l = 100;
		for (let a = -128; a < 129; a += 10) {
			for (let b = -128; b < 129; b += 10) {
				writer.row([l, a, b]);
			}
		}
	}

	// All channels, but reduced range
	for (let a = -50; a < 50; a+=5) {
		for (let b = -50; b < 50; b+=5) {
			for (let l = 0; l < 100; l += 5) {
				writer.row([l, a, b]);
			}
		}
	}

		writer.end();
})();
