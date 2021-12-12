import { deltaEOK } from './deltaEOK.js';

type color = [number, number, number];

export function mapGamut(startOKLCH: color, toDestination: (x: color) => color, fromDestination: (x: color) => color): color {
	return binarySearchGamut(startOKLCH, startOKLCH[1] / 3, toDestination, fromDestination);
}

function binarySearchGamut(startOKLCH: color, startAmount: number, toDestination: (x: color) => color, fromDestination: (x: color) => color): color {
	let currentAmount = startAmount;
	let current = startOKLCH;

	while (currentAmount > 0.000001) {
		
		const reducedChroma = [current[0], current[1] - currentAmount, current[2]] as color;
		const converted = toDestination([...reducedChroma]);

		currentAmount = currentAmount / 2;
		if (reducedChroma[1] <= 0) {
			continue
		}

		if (inGamut(converted)) {
			continue;
		}

		const convertedClipped = clip(converted);
		const clippedOKLCH = fromDestination([...convertedClipped]);
		if (deltaEOK(reducedChroma, clippedOKLCH) < 0.02) {
			return convertedClipped;
		}

		currentAmount = startAmount;
		current = reducedChroma;
	}

	return clip(toDestination([...current]));
}

export function clip(color: color): color {
	return color.map(val => {
		if (val < 0) {
			return 0;
		} else if (val > 1) {
			return 1;
		} else {
			return val;
		}
	}) as color;
}

export function inGamut(x: color): boolean {
	const [xX, xY, xZ] = x;
	return xX >= -0.0001 && xX <= 1.0001 && xY >= -0.0001 && xY <= 1.0001 && xZ >= -0.0001 && xZ <= 1.0001;
}

