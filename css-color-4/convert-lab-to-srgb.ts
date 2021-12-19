import { D50_to_D65, gam_P3, gam_sRGB, Lab_to_XYZ, lin_P3, lin_P3_to_XYZ, lin_sRGB, lin_sRGB_to_XYZ, OKLab_to_OKLCH, OKLab_to_XYZ, OKLCH_to_OKLab, XYZ_to_lin_P3, XYZ_to_lin_sRGB, XYZ_to_OKLab } from './conversions.js';
import { clip, inGamut, mapGamut } from './map-gamut.js';

type color = [number, number, number];

export function labToP3(lab: color): { color: color, inGamut: boolean } {
	let conversion = lab.slice() as color;

	// https://drafts.csswg.org/css-color-4/#oklab-lab-to-predefined
	// 1. Convert Lab to(D50 - adapted) XYZ
	conversion = Lab_to_XYZ(conversion);

	let oklch = conversion.slice() as color;
	oklch = D50_to_D65(oklch);
	oklch = XYZ_to_OKLab(oklch);
	oklch = OKLab_to_OKLCH(oklch);

	// 2. If needed, convert from a D50 whitepoint(used by Lab) to the D65 whitepoint used in sRGB and most other RGB spaces, with the Bradford transform.prophoto - rgb' does not require this step.
	conversion = D50_to_D65(conversion);
	// 3. Convert from(D65 - adapted) CIE XYZ to linear P3
	conversion = XYZ_to_lin_P3(conversion);
	// 4. Convert from linear - light P3 to P3(do gamma encoding)
	conversion = gam_P3(conversion);

	if (inGamut(conversion)) {
		return {
			color: clip(conversion),
			inGamut: true
		};
	}

	return {
		color: mapGamut(oklch, (x: color) => {
			x = OKLCH_to_OKLab(x);
			x = OKLab_to_XYZ(x);
			x = XYZ_to_lin_P3(x);
			return gam_sRGB(x);
		}, (x: color) => {
			x = lin_P3(x);
			x = lin_P3_to_XYZ(x);
			x = XYZ_to_OKLab(x);
			return OKLab_to_OKLCH(x);
		}),
		inGamut: false
	};
}

export function labToSRgb(lab: color): { color: color, inGamut: boolean } {
	let conversion = lab.slice() as color;

	// https://drafts.csswg.org/css-color-4/#oklab-lab-to-predefined
	// 1. Convert Lab to(D50 - adapted) XYZ
	conversion = Lab_to_XYZ(conversion);

	let oklch = conversion.slice() as color;
	oklch = D50_to_D65(oklch);
	oklch = XYZ_to_OKLab(oklch);
	oklch = OKLab_to_OKLCH(oklch);

	// 2. If needed, convert from a D50 whitepoint(used by Lab) to the D65 whitepoint used in sRGB and most other RGB spaces, with the Bradford transform.prophoto - rgb' does not require this step.
	conversion = D50_to_D65(conversion);
	// 3. Convert from(D65 - adapted) CIE XYZ to linear RGB
	conversion = XYZ_to_lin_sRGB(conversion);
	// 4. Convert from linear - light RGB to RGB(do gamma encoding)
	conversion = gam_sRGB(conversion);

	if (inGamut(conversion)) {
		return {
			color: clip(conversion),
			inGamut: true
		};
	}

	return {
		color: mapGamut(oklch, (x: color) => {
			x = OKLCH_to_OKLab(x);
			x = OKLab_to_XYZ(x);
			x = XYZ_to_lin_sRGB(x);
			return gam_sRGB(x);
		}, (x: color) => {
			x = lin_sRGB(x);
			x = lin_sRGB_to_XYZ(x);
			x = XYZ_to_OKLab(x);
			return OKLab_to_OKLCH(x);
		}),
		inGamut: false
	};
}
