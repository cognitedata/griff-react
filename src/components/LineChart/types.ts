import { SizeMeProps } from 'react-sizeme';
import { ItemId, Domain } from 'external';
import { AxisPlacement } from 'components/AxisPlacement';
import { AxisDisplayMode } from 'utils/AxisDisplayMode';
import { TickFormatter } from 'utils/Axes';

type Point = {
  id: ItemId;
  name: string;
  color: string;
  timestamp: Date;
  rawTimestamp?: Date;
  value: number;
  x: number;
  y: number;
};

type Ruler = {
  visible: boolean;
  timeLabel: React.ReactNode;
  yLabel: React.ReactNode;
  // a timestamp representing the initial position of the ruler
  timestamp: number;
  // a function that determines the position of the timestamp
  // (defaultPosition:number, {height:number, toolTipHeight:number, timeLabelMargin:number}) => number
  getTimeLabelPosition: (
    defaultPosition: number,
    layout: { height: number; toolTipHeight: number; timeLabelMargin: number }
  ) => number;
};

type ContextChart = {
  visible: boolean;
  height: number;
};

type Annotation = {
  data: number[];
  xScale: (rawX: number) => number;
  height: number;
  id: ItemId;
  color: string;
  fillOpacity: number;
};

type Coordinate = {
  xval?: number;
  yval?: number;
  points?: Point[];
};

export type Area = {
  id: ItemId;
  color: string;
  start?: Coordinate;
  end?: Coordinate;
  seriesId: ItemId;
};

export type LineChartProps = SizeMeProps & {
  // size props
  width?: number;
  height?: number;

  // visual options
  zoomable?: boolean;
  crosshair?: boolean;
  pointWidth?: number;

  xSubDomain?: Domain;
  xAxisHeight?: number;
  xAxisFormatter?: TickFormatter;
  xAxisPlacement?: AxisPlacement;

  yAxisWidth?: number;
  yAxisTicks?: number;
  yAxisFormatter?: TickFormatter;
  yAxisDisplayMode?: AxisDisplayMode;

  // additional display elements
  contextChart?: ContextChart;
  ruler?: Ruler;
  annotations?: Annotation[];
  areas?: Area[];

  // event based function props
  onMouseMove?: (args: {
    points: Point[];
    xpos?: number;
    ypos?: number;
    e: React.MouseEvent;
  }) => void;
  onMouseOut?: (e: React.MouseEvent) => void;
  onBlur?: (e: React.MouseEvent) => void;
  onClick?: (e: React.MouseEvent) => void;
  // (annotation, x, y) => void
  // onClickAnnotation: func,
  // event => void
  // onDoubleClick: func,
  // ({ xSubDomain, transformation }) => void
  // onZoomXAxis: func,
  // Number => String
  // (e, seriesId) => void
  // onAxisMouseEnter: func,
  // (e, seriesId) => void
  // onAxisMouseLeave: func,

  /**
   * Pass in a callback function which will be given a defined area when the
   * user creates one. See the definition in proptypes.js for a description of
   * what this object will look like.
   *
   * If this is set, then the chart will not have zooming functionality, because
   * the area definition mechanism (dragging a box with the mouse) conflicts
   * with the panning gesture. If both pieces of functionality are desired, then
   * this should only be set conditionally when the area definition
   * functionality should be enabled.
   */
  onAreaDefined?: (newArea: Area) => void;
  // (area, xpos, ypos) => shouldContinue
  onAreaClicked?: (area: Area, xpos: number, ypos: number) => boolean;

  // The following props are all supplied by internals (eg, React).
  children?: React.ReactNode;
};
