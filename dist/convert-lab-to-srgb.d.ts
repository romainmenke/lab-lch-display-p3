declare type color = [number, number, number];
export declare function labToP3(lab: color): {
    color: color;
    inGamut: boolean;
};
export declare function labToSRgb(lab: color): {
    color: color;
    inGamut: boolean;
};
export {};
