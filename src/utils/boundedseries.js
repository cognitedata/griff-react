// HTML has an issue with drawing points somewhere in the 30-35M range.
// There's no point in drawing pixels more than 30k pixels outside of the range
// so this hack will work for a while.
// Without this, when zoomed far enough in the line will disappear.
export const boundedSeries = value => Math.min(Math.max(value, -30000), 30000);
