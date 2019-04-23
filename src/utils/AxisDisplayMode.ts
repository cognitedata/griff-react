export interface AxisDisplayMode {
  id: string;
  width: (axisWidth: number, numAxes: number) => number;
  toString: () => string;
}

export const ALL: AxisDisplayMode = {
  id: 'ALL',
  width: (axisWidth, numAxes) => +axisWidth * +numAxes,
  toString: () => 'ALL',
};
export const NONE: AxisDisplayMode = {
  id: 'NONE',
  width: () => 0,
  toString: () => 'NONE',
};
export const COLLAPSED: AxisDisplayMode = {
  id: 'COLLAPSED',
  width: (axisWidth, numAxes = 0) => Math.min(+numAxes, 1) * +axisWidth,
  toString: () => 'COLLAPSED',
};

export default {
  ALL,
  NONE,
  COLLAPSED,
};
