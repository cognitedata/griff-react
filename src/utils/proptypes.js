import PropTypes from 'prop-types';

export const singleSeriePropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  color: PropTypes.string,
  hidden: PropTypes.bool,
  strokeWidth: PropTypes.number,
  drawPoints: PropTypes.bool,
  loader: PropTypes.func,
  step: PropTypes.bool,
  xAccessor: PropTypes.func,
  yAccessor: PropTypes.func,
  y0Accessor: PropTypes.func,
  y1Accessor: PropTypes.func,
  yDomain: PropTypes.arrayOf(PropTypes.number.isRequired),
  yAxisDisplayMode: PropTypes.shape({
    // See AxisDisplayMode
    id: PropTypes.string.isRequired,
    width: PropTypes.func.isRequired,
  }),
});

export const seriesPropType = PropTypes.arrayOf(singleSeriePropType);

export const annotationShape = {
  data: PropTypes.arrayOf(PropTypes.number),
  xScale: PropTypes.func,
  height: PropTypes.number,
  id: PropTypes.number,
  color: PropTypes.string,
  fillOpacity: PropTypes.number,
};

export const annotationPropType = PropTypes.shape(annotationShape);

export const pointPropType = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string,
  color: PropTypes.string,
  timestamp: PropTypes.number,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  x: PropTypes.number,
  y: PropTypes.number,
});

export const rulerPropType = PropTypes.shape({
  visible: PropTypes.bool,
  xLabel: PropTypes.func.isRequired,
  yLabel: PropTypes.func.isRequired,
});

export const contextChartPropType = PropTypes.shape({
  visible: PropTypes.bool,
  height: PropTypes.number,
});

export const axisDisplayModeType = PropTypes.shape({
  // (axisWidth, numAxes) => (width of all of the axes)
  width: PropTypes.func.isRequired,
});

export const coordinatePropType = PropTypes.shape({
  xpos: PropTypes.number.isRequired,
  ypos: PropTypes.number.isRequired,
  points: PropTypes.arrayOf(pointPropType),
});

export const areaPropType = PropTypes.shape({
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  color: PropTypes.string,
  start: coordinatePropType.isRequired,
  end: coordinatePropType,
});
