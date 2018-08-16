const AxisDisplayMode = {
  ALL: {
    id: 'ALL',
    width: (axisWidth, numAxes) => +axisWidth * +numAxes,
    toString: () => 'ALL',
  },
  NONE: { id: 'NONE', width: () => 0, toString: () => 'NONE' },
  COLLAPSED: {
    id: 'COLLAPSED',
    width: (axisWidth, numAxes = 0) => Math.min(+numAxes, 1) * +axisWidth,
    toString: () => 'COLLAPSED',
  },
};

export default AxisDisplayMode;
