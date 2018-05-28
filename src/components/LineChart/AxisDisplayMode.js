const AxisDisplayMode = {
  ALL: { id: 'ALL', width: (axisWidth, numAxes) => +axisWidth * +numAxes },
  NONE: { id: 'NONE', width: () => 0 },
  COLLAPSED: {
    id: 'COLLAPSED',
    width: (axisWidth, numAxes = 0) => Math.min(+numAxes, 1) * +axisWidth,
  },
};

export default AxisDisplayMode;
