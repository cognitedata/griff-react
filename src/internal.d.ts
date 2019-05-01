import { ItemId, Domain, AccessorFunction } from './external';
import { AxisDisplayMode } from './utils/AxisDisplayMode';

export interface Item {
  id: ItemId;
  data: Datapoint[];
  color?: string;
  hidden?: boolean;
  drawPoints?: boolean;
  timeAccessor: AccessorFunction;
  xAccessor: AccessorFunction;
  x0Accessor: AccessorFunction;
  x1Accessor: AccessorFunction;
  yAccessor: AccessorFunction;
  y0Accessor: AccessorFunction;
  y1Accessor: AccessorFunction;
  timeDomain?: Domain;
  timeSubDomain?: Domain;
  xDomain?: Domain;
  xSubDomain?: Domain;
  yDomain?: Domain;
  ySubDomain?: Domain;
  yAxisDisplayMode?: AxisDisplayMode;
  pointWidth?: number;
}

export interface SizeProps {
  width: number;
  height: number;
}

export interface ItemIdMap<T> {
  [itemId: string]: T;
}
