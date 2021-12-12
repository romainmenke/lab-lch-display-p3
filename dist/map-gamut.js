import { deltaEOK } from './deltaEOK.js';
export function mapGamut(startOKLCH, toDestination, fromDestination) {
    return binarySearchGamut(startOKLCH, startOKLCH[1] / 3, toDestination, fromDestination);
}
function binarySearchGamut(startOKLCH, startAmount, toDestination, fromDestination) {
    let currentAmount = startAmount;
    let current = startOKLCH;
    while (currentAmount > 0.000001) {
        const reducedChroma = [current[0], current[1] - currentAmount, current[2]];
        const converted = toDestination([...reducedChroma]);
        currentAmount = currentAmount / 2;
        if (reducedChroma[1] <= 0) {
            continue;
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
export function clip(color) {
    return color.map(val => {
        if (val < 0) {
            return 0;
        }
        else if (val > 1) {
            return 1;
        }
        else {
            return val;
        }
    });
}
export function inGamut(x) {
    const [xX, xY, xZ] = x;
    return xX >= -0.0001 && xX <= 1.0001 && xY >= -0.0001 && xY <= 1.0001 && xZ >= -0.0001 && xZ <= 1.0001;
}
