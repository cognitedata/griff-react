import PropTypes from 'prop-types';
import { AxisDisplayMode } from '../';
import AxisPlacement from '../components/AxisPlacement';

const idPropType = PropTypes.oneOfType([PropTypes.number, PropTypes.string]);

export const singleSeriePropType = PropTypes.shape({
  id: idPropType.isRequired,
  collectionId: idPropType,
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
  xpos: PropTypes.number.isRequired,
  ypos: PropTypes.number.isRequired,
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
  drawPoints: PropTypes.bool,
  hidden: PropTypes.bool,
  strokeWidth: PropTypes.number,
  xAccessor: PropTypes.func,
  yAxisDisplayMode: PropTypes.instanceOf(AxisDisplayMode),
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
const grid = PropTypes.shape({
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
});

export default {
  axisPlacement,
  collection,
  collections,
  contextChart,
  grid,
  multipleSeries,
  singleSeries,
};
