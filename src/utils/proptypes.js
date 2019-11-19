import PropTypes from 'prop-types';
import AxisDisplayModes from '../utils/AxisDisplayMode';
import AxisPlacement from '../components/AxisPlacement';

const idPropType = PropTypes.oneOfType([PropTypes.number, PropTypes.string]);

/**
 * If a {@code boolean} is passed, then this will enable (or disable) the
 * default rendering.
 * If a {@code function} is passed, then this will be used as the rendering
 * function for rendering the points.
 *
 * @see {@code drawPoints} on {@link DataProvider} for more information.
 */
const drawPoints = PropTypes.oneOfType([PropTypes.bool, PropTypes.func]);

export const singleSeriePropType = PropTypes.shape({
  id: idPropType.isRequired,
  collectionId: idPropType,
  color: PropTypes.string,
  hidden: PropTypes.bool,
  opacity: PropTypes.number,
  strokeWidth: PropTypes.number,
  drawPoints,
  /**
   * If unset, this defaults to {@code true} for line charts and {@code false}
   * for scatterplots.
   * This will likely be consolidated into a standardized default in the future.
   */
  drawLines: PropTypes.bool,
  loader: PropTypes.func,
  step: PropTypes.bool,
  xAccessor: PropTypes.func,
  x0Accessor: PropTypes.func,
  x1Accessor: PropTypes.func,
  yAccessor: PropTypes.func,
  y0Accessor: PropTypes.func,
  y1Accessor: PropTypes.func,
  yDomain: PropTypes.arrayOf(PropTypes.number.isRequired),
  ySubDomain: PropTypes.arrayOf(PropTypes.number.isRequired),
  yAxisDisplayMode: PropTypes.shape({
    // See AxisDisplayMode
    id: PropTypes.string.isRequired,
    width: PropTypes.func.isRequired,
  }),
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
  id: idPropType,
  name: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  timestamp: PropTypes.number.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
});

// TODO: Do we have any required fields on this?
export const dataPointPropType = PropTypes.shape({});

export const rulerPropType = PropTypes.shape({
  visible: PropTypes.bool,
  timeLabel: PropTypes.func.isRequired,
  yLabel: PropTypes.func.isRequired,
  // a timestamp representing the initial position of the ruler
  timestamp: PropTypes.number,
  // a function that determines the position of the timestamp
  // (defaultPosition:number, {height:number, toolTipHeight:number, timeLabelMargin:number}) => number
  getTimeLabelPosition: PropTypes.func,
});

const contextChart = PropTypes.shape({
  visible: PropTypes.bool,
  // Height of the chart, *excluding* any axes that are rendered.
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

const axisPlacement = PropTypes.oneOf(Object.values(AxisPlacement));

export const coordinatePropType = PropTypes.shape({
  xval: PropTypes.number.isRequired,
  yval: PropTypes.number.isRequired,
  points: PropTypes.arrayOf(pointPropType),
});

export const areaPropType = PropTypes.shape({
  id: idPropType,
  color: PropTypes.string,
  start: coordinatePropType.isRequired,
  end: coordinatePropType,
});

const collection = PropTypes.shape({
  id: idPropType.isRequired,
  // This the color used when referencing the collection (eg, the common axis)
  color: PropTypes.string,
  /**
   * If unset, this defaults to {@code true} for line charts and {@code false}
   * for scatterplots.
   * This will likely be consolidated into a standardized default in the future.
   */
  drawLines: PropTypes.bool,
  drawPoints,
  hidden: PropTypes.bool,
  opacity: PropTypes.number,
  strokeWidth: PropTypes.number,
  xAccessor: PropTypes.func,
  yAxisDisplayMode: PropTypes.instanceOf(AxisDisplayModes),
  yAccessor: PropTypes.func,
  y0Accessor: PropTypes.func,
  y1Accessor: PropTypes.func,
  yDomain: PropTypes.arrayOf(PropTypes.number.isRequired),
  ySubDomain: PropTypes.arrayOf(PropTypes.number.isRequired),
});

const collections = PropTypes.arrayOf(collection);

const singleSeries = singleSeriePropType;

const multipleSeries = PropTypes.arrayOf(singleSeries);

/**
 * Specification for the grid rendered under the data.
 */
const grid = {
  /** Color of the lines (default: #000) */
  color: PropTypes.string,
  /** Thickness of the lines (default: 1) */
  strokeWidth: PropTypes.number,
  /** Opacity of the lines (default: 0.4) */
  opacity: PropTypes.number,

  /**
   * Defines the behavior of the vertical grid lines (rendered from the X axis)
   */
  x: PropTypes.shape({
    /** Render lines every X pixels */
    pixels: PropTypes.number,

    /**
     * Render this many lines (approximatey). If this is `0`, then the lines
     * will match the tick marks on the x axis.
     */
    count: PropTypes.number,

    /**
     * Color of the lines. If this is not specified, then the top-level color
     * property will be used.
     */
    color: PropTypes.string,

    /**
     * Thickness of the lines. If this is not specified, then the top-level
     * strokeWidth property will be used.
     */
    strokeWidth: PropTypes.number,

    /**
     * Opaccity of the lines. If this is not specified, then the top-level
     * opacity property will be used.
     */
    opacity: PropTypes.number,
  }),

  /**
   * Defines the behavior of the horizontal grid lines (rendered from the Y
   * axis)
   */
  y: PropTypes.shape({
    /** Render lines every X pixels */
    pixels: PropTypes.number,

    /**
     * The series ID to link these lines to for scaling purposes. This way they
     * will be redrawn the y axis is zoomed, translated, etc.
     */
    seriesId: idPropType,

    /**
     * Render this many lines (approximatey). If this is `0`, then the lines
     * will match the tick marks on the x axis.
     */
    count: PropTypes.number,

    /**
     * Color of the lines. If this is `null` (magic value), and `seriesId`
     * points to a series, then that color will be used. However, if `seriesId`
     * is not set, then the top-level color will be used.
     */
    color: PropTypes.string,

    /**
     * Thickness of the lines. If this is not specified, then the top-level
     * strokeWidth property will be used.
     */
    strokeWidth: PropTypes.number,

    /**
     * Opaccity of the lines. If this is not specified, then the top-level
     * opacity property will be used.
     */
    opacity: PropTypes.number,
  }),
};

const updateDomains = PropTypes.func;

const domainsByItemId = PropTypes.objectOf(
  PropTypes.shape({
    time: domainPropType,
    x: domainPropType,
    y: domainPropType,
  })
);

const zoomAxes = PropTypes.shape({
  time: PropTypes.bool,
  x: PropTypes.bool,
  y: PropTypes.bool,
});

const axes = PropTypes.oneOf(['time', 'x', 'y']);

export default {
  axisPlacement,
  collection,
  collections,
  contextChart,
  drawPoints,
  grid,
  multipleSeries,
  singleSeries,
  updateDomains,
  domainsByItemId,
  subDomainsByItemId: domainsByItemId,
  zoomAxes,
  axes,
};
