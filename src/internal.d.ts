import {
  ItemId,
  Domain,
  AccessorFunction,
  LoaderFunction,
  Datapoint,
  PointRenderer,
} from './external';
import { AxisDisplayMode } from './utils/AxisDisplayMode';

export interface Item {
  id: ItemId;
  color?: string;
  hidden?: boolean;
  drawPoints?: boolean | PointRenderer;
  timeAccessor: AccessorFunction;
  xAccessor: AccessorFunction;
  x0Accessor: AccessorFunction;
  x1Accessor: AccessorFunction;
  yAccessor: AccessorFunction;
  y0Accessor: AccessorFunction;
  y1Accessor: AccessorFunction;
  timeDomain: Domain;
  timeSubDomain: Domain;
  xDomain: Domain;
  xSubDomain: Domain;
  yDomain: Domain;
  ySubDomain: Domain;
  yAxisDisplayMode?: AxisDisplayMode;
  pointWidth?: number;
  pointsPerSeries?: number;
  loader?: LoaderFunction;
}

export interface IncomingItem {
  id: ItemId;
  color?: string;
  hidden?: boolean;
  drawLines?: boolean;
  drawPoints?: boolean | PointRenderer;
  strokeWidth?: number;
  opacity?: number;
  opacityAccessor?: AccessorFunction;
  pointWidthAccessor?: AccessorFunction;
  timeAccessor?: AccessorFunction;
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
  pointWidth?: number;
  pointsPerSeries?: number;
  loader?: LoaderFunction;
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
  x0Accessor: AccessorFunction;
  x1Accessor: AccessorFunction;
  yAccessor: AccessorFunction;
  y0Accessor: AccessorFunction;
  y1Accessor: AccessorFunction;
  yAxisDisplayMode: AxisDisplayMode;
  pointWidth: number;
  pointsPerSeries: number;

  timeDomain: Domain;
}

export interface BaseCollection extends IncomingCollection {
  color: string;
  hidden: boolean;
  drawLines: boolean;
  drawPoints: boolean;
  timeAccessor: AccessorFunction;
  xAccessor: AccessorFunction;
  x0Accessor: AccessorFunction;
  x1Accessor: AccessorFunction;
  yAccessor: AccessorFunction;
  y0Accessor: AccessorFunction;
  y1Accessor: AccessorFunction;
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
  x0Accessor: AccessorFunction;
  x1Accessor: AccessorFunction;
  yAccessor: AccessorFunction;
  y0Accessor: AccessorFunction;
  y1Accessor: AccessorFunction;
  yAxisDisplayMode: AxisDisplayMode;
  pointWidth: number;
  pointsPerSeries: number;
  loader: LoaderFunction;

  // Only timeDomain is guaranteed to exist when it enters the pipeline.
  timeDomain: Domain;
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

export interface MinimalSeries {
  id: ItemId;
  color: string;
  hidden: boolean;
  drawLines: boolean;
  drawPoints: boolean;
  timeAccessor: AccessorFunction;
  xAccessor: AccessorFunction;
  x0Accessor: AccessorFunction;
  x1Accessor: AccessorFunction;
  yAccessor: AccessorFunction;
  y0Accessor: AccessorFunction;
  y1Accessor: AccessorFunction;
  timeDomain: Domain;
  timeSubDomain: Domain;
  xDomain: Domain;
  xSubDomain: Domain;
  yDomain: Domain;
  ySubDomain: Domain;
  yAxisDisplayMode: AxisDisplayMode;
  pointWidth: number;
  pointsPerSeries: number;
  loader: LoaderFunction;
}
