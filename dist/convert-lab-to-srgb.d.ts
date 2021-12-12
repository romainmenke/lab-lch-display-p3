declare type color = [number, number, number];
export declare function labToSRgb(lab: color): {
    color: color;
    inGamut: boolean;
};
export {};
