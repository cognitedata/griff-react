/** Control how an axis is rendered on the screen. */
// TODO: Consider rewriting this as an enum.
export interface AxisDisplayMode {
  id: string;
  width: (axisWidth: number, numAxes: number) => number;
  toString: () => string;
}

const AXIS_DISPLAY_MODES: {
  ALL: AxisDisplayMode;
  NONE: AxisDisplayMode;
  COLLAPSED: AxisDisplayMode;
} = {
  ALL: {
    id: 'ALL',
    width: (axisWidth, numAxes) => +axisWidth * +numAxes,
    toString: () => 'ALL',
  },
  NONE: {
    id: 'NONE',
    width: () => 0,
    toString: () => 'NONE',
  },
  COLLAPSED: {
    id: 'COLLAPSED',
    width: (axisWidth, numAxes = 0) => Math.min(+numAxes, 1) * +axisWidth,
    toString: () => 'COLLAPSED',
  },
};

export default AXIS_DISPLAY_MODES;
