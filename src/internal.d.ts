import {
  ItemId,
  Domain,
  AccessorFunction,
  LoaderFunction,
  Datapoint,
  PointRenderer,
} from './external';
import { AxisDisplayMode } from './utils/AxisDisplayMode';

// If you add things to this, consider whether they should be added to the
// WATCHED_PROP_NAMES array in the Series object!
export interface IncomingItem {
  id: ItemId;
  color?: string;
  hidden?: boolean;
  drawLines?: boolean;
  drawPoints?: boolean | PointRenderer;
  step?: boolean;
  name?: string;
  strokeWidth?: number;
  opacity?: number;
  opacityAccessor?: AccessorFunction;
  pointWidthAccessor?: AccessorFunction;
  timeAccessor?: AccessorFunction;
  zoomable?: boolean;
  xAccessor?: AccessorFunction;
  x0Accessor?: AccessorFunction;
  x1Accessor?: AccessorFunction;
  yAccessor?: AccessorFunction;
  y0Accessor?: AccessorFunction;
  y1Accessor?: AccessorFunction;
  timeDomain?: Domain;
  timeSubDomain?: Domain;
  xDomain?: Domain;
  xSubDomain?: Domain;
  yDomain?: Domain;
  ySubDomain?: Domain;
  yAxisDisplayMode?: AxisDisplayMode;
  yAxisPlacement?: AxisPlacement;
  pointWidth?: number;
  pointsPerSeries?: number;
  loader?: LoaderFunction;
  updateInterval?: number;
}

export interface IncomingCollection extends IncomingItem {}

export interface IncomingSeries extends IncomingItem {
  data?: Datapoint[];
  collectionId?: ItemId;
}

export interface SizeProps {
  width: number;
  height: number;
}

export interface ItemIdMap<T> {
  [itemId: string]: T;
}

export interface DataDomains {
  time: Domain;
  x: Domain;
  y: Domain;
}

export interface BaseItem extends IncomingItem {
  color: string;
  hidden: boolean;
  drawLines: boolean;
  drawPoints: boolean | PointRenderer;
  timeAccessor: AccessorFunction;
  xAccessor: AccessorFunction;
  yAccessor: AccessorFunction;
  yAxisDisplayMode: AxisDisplayMode;
  pointWidth: number;
  pointsPerSeries: number;
  zoomable: boolean;
  name: string;
  updateInterval: number;

  timeDomain: Domain;
}

export interface BaseCollection extends IncomingCollection {
  color: string;
  hidden: boolean;
  // TODO: Does it make sense to have this stuff? Collections don't have these
  // for any purpose other than providing inheritance to its member Series ...
  drawLines: boolean;
  drawPoints: boolean;
  timeAccessor: AccessorFunction;
  xAccessor: AccessorFunction;
  yAccessor: AccessorFunction;
  yAxisDisplayMode: AxisDisplayMode;
  pointWidth: number;
  pointsPerSeries: number;

  timeDomain: Domain;
}

export interface ScaledCollection extends BaseCollection {
  timeSubDomain: Domain;
  xDomain: Domain;
  xSubDomain: Domain;
  yDomain: Domain;
  ySubDomain: Domain;
}

export interface BaseSeries extends IncomingSeries {
  // All of these things are populated when the Series enters the Griff
  // context provider pipeline.
  color: string;
  hidden: boolean;
  drawLines: boolean;
  drawPoints: boolean;
  timeAccessor: AccessorFunction;
  xAccessor: AccessorFunction;
  yAccessor: AccessorFunction;
  yAxisDisplayMode: AxisDisplayMode;
  pointWidth: number;
  pointsPerSeries: number;
  loader: LoaderFunction;
  step: boolean;

  // Only timeDomain is guaranteed to exist when it enters the pipeline.
  timeDomain: Domain;
  updateInterval?: number;
}

export interface ScaledSeries extends BaseSeries {
  // When a Series leaves the Scaler, these are guaranteed to be populated.
  timeDomain: Domain;
  timeSubDomain: Domain;
  xDomain: Domain;
  xSubDomain: Domain;
  yDomain: Domain;
  ySubDomain: Domain;
}

export interface DataSeries extends ScaledSeries {
  // These are guaranteed to be populated when it leaves the DataProvider.
  data: Datapoint[];
  dataDomains: DataDomains;
}
