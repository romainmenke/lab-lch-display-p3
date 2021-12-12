// https://github.com/w3c/csswg-drafts/blob/main/css-color-4/multiply-matrices.js
/**
 * Simple matrix (and vector) multiplication
 * Warning: No error handling for incompatible dimensions!
 * @author Lea Verou 2020 MIT License
 */
// A is m x n. B is n x p. product is m x p.
export function multiplyMatrices(a, b) {
    const m = a.length;
    let A;
    if (!Array.isArray(a[0])) {
        // A is vector, convert to [[a, b, c, ...]]
        A = [a];
    }
    else {
        A = a;
    }
    let B;
    if (!Array.isArray(b[0])) {
        // B is vector, convert to [[a], [b], [c], ...]]
        B = b.map(x => [x]);
    }
    const p = B[0].length;
    const B_cols = B[0].map((_, i) => B.map(x => x[i])); // transpose B
    let product = A.map(row => B_cols.map(col => {
        if (!Array.isArray(row)) {
            return col.reduce((d, f) => d + f * row, 0);
        }
        return row.reduce((d, f, i) => d + f * (col[i] || 0), 0);
    }));
    if (m === 1) {
        product = product[0]; // Avoid [[a, b, c, ...]]
    }
    if (p === 1) {
        return product.map(x => x[0]); // Avoid [[a], [b], [c], ...]]
    }
    return product;
}
