import { Item } from './internal';

export * from './components/AxisPlacement';
export type Domain = [number, number] & {
  placeholder?: boolean;
  calculated?: boolean;
};

export type ItemId = string | number;

export interface Series extends Item {
  collectionId?: ItemId;
}

export interface Collection extends Item {}

export interface Datapoint {
  timestamp?: number;
  x?: number;
  y?: number;
}

export type AccessorFunction = (
  d: Datapoint,
  i?: number,
  arr?: Datapoint[]
) => number;

export interface PointRendererMetadata {
  x: number;
  x0?: number;
  x1?: number;
  y: number;
  y0?: number;
  y1?: number;
  color?: string;
  opacity?: number;
  opacityAccessor?: AccessorFunction;
  pointWidth?: number;
  pointWidthAccessor?: AccessorFunction;
  strokeWidth?: number;
}

export type PointRenderer = (
  d: Datapoint,
  i: number,
  data: Datapoint[],
  metadata: PointRendererMetadata,
  uiElements: React.ReactElement[]
) => React.ReactElement[] | null;
