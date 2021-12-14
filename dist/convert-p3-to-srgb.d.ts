declare type color = [number, number, number];
export declare function p3ToSRgb(lab: color): {
    color: color;
    inGamut: boolean;
};
export {};
