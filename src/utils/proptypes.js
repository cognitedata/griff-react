import PropTypes from 'prop-types';
import AxisDisplayMode from '../components/LineChart/AxisDisplayMode';

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
  yAxisDisplayMode: PropTypes.shape(AxisDisplayMode),
});

export const seriesPropType = PropTypes.arrayOf(singleSeriePropType);

export const domainPropType = PropTypes.arrayOf(PropTypes.number.isRequired);

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

// TODO: Do we have any required fields on this?
export const dataPointPropType = PropTypes.shape({});

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

// (domain, [width|height]) => [number, number]
export const scalerFactoryFunc = PropTypes.func;

// datapoint => value
export const accessorFuncPropType = PropTypes.func;

// value => scaled value
export const scaleFuncPropType = PropTypes.func;
