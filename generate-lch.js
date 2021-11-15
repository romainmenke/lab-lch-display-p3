const fs = require('fs');
const uuid = require('crypto').randomUUID;
const conversions = require('./conversion.js');
const { LCH_to_sRGB, LCH_to_P3 } = conversions;

class Writer {
	constructor() {
		this.css = [];
		this.html = [];
	}

	row(lch) {
		const id = uuid();

		const sRGB = LCH_to_sRGB(lch);
		const p3 = LCH_to_P3(lch);

		this.css.push(`
			.raw-${id} {
				background-color: lch(${lch[0]}% ${lch[1]} ${lch[2]});
			}

			.rgb-${id} {
				background-color: rgb(${sRGB[0]*255}, ${sRGB[1]*255}, ${sRGB[2]*255});
			}

			.display-p3-${id} {
				background-color: color(display-p3 ${p3[0]} ${p3[1]} ${p3[2]});
			}
		`);
		
		this.html.push(`
			<div class="swatch">
				<div class="raw-${id}"></div>
				<div class="rgb-${id}"></div>
				<div class="display-p3-${id}"></div>
				<div class="raw-${id}"></div>
			</div>
		`);

		if (this.html.length > 250) {
			console.log(`writing to file and clear buffers`);
			fs.writeFileSync('./lch.html', this.html.join(''), { flag: 'a+' });
			this.html = [];
		}

		if (this.css.length > 250) {
			fs.writeFileSync('./stylesheet-lch.css', this.css.join(''), { flag: 'a+' });
			this.css = [];
		}
	}

	start() {
		fs.writeFileSync('./lch.html', `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Color swatches</title>

	<link rel="stylesheet" href="stylesheet-lch.css">

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
			<div>lch -> sRGB</div>
			<div>lch -> P3</div>
			<div>raw</div>
		</div>
	`);

		fs.writeFileSync('./stylesheet-lch.css', '');
	}

	end() {
		fs.writeFileSync('./stylesheet-lch.css', this.css.join(''), { flag: 'a+' });

		fs.writeFileSync('./lch.html', `
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

	// Full range
	for (let c = 0; c < 230; c+=15) {
		for (let h = 0; h < 360; h+=15) {
			for (let l = 0; l < 101; l+=15) {
				writer.row([(l / 100), c, h]);
			}
		}
	}

	// Max value for A
	{
		let c = 230;
		for (let h = 0; h < 360; h += 15) {
			for (let l = 0; l < 101; l += 15) {
				writer.row([(l / 100), c, h]);
			}
		}
	}

	// Max value for B
	{
		let h = 360;
		for (let c = 0; c < 230; c += 15) {
			for (let l = 0; l < 101; l += 15) {
				writer.row([(l / 100), c, h]);
			}
		}
	}

	// Max value for L
	{
		let l = 100;
		for (let c = 0; c < 230; c += 15) {
			for (let h = 0; h < 360; h += 15) {
				writer.row([(l / 100), c, h]);
			}
		}
	}

		writer.end();
})();
