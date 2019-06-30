import { DataSeries, ScaledCollection } from './internal';

export * from './components/AxisPlacement';

export enum DomainPriority {
  UNSPECIFIED,
  PLACEHOLDER,
  CALCULATED,
  GRIFF,
  COLLECTION,
  SERIES,
  USER_GENERATED,
}

export type Domain = [number, number] & {
  priority: DomainPriority;
};

export type BuildingDomain = [number, number] & { priority?: DomainPriority };

export type ItemId = string | number;

export type Series = DataSeries;

export type Collection = ScaledCollection;

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

export type LoaderResult = Partial<Series> & { id: ItemId } & {
  data: Datapoint[];
};

export type LoaderReason = 'MOUNTED' | 'SUBDOMAIN_CHANGED';

export interface LoaderParams {
  oldSeries: LoaderResult;
  reason: LoaderReason;
}

export type LoaderFunction = (args: any) => Promise<LoaderResult>;
