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
  yDomain: PropTypes.arrayOf(PropTypes.number.isRequired),
});

export const seriesPropType = PropTypes.arrayOf(singleSeriePropType);

export const annotationPropType = {
  data: PropTypes.arrayOf(PropTypes.number),
  xScale: PropTypes.func,
  height: PropTypes.number,
  id: PropTypes.number,
  color: PropTypes.string,
  fillOpacity: PropTypes.number,
};

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
  xLabel: PropTypes.func.isRequired,
  yLabel: PropTypes.func.isRequired,
});
