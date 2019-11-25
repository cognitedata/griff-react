import { Datapoint, Domain, Series } from 'external';

export type LoaderProps = {
  timeDomain: Domain;
  timeSubDomain: Domain;
  pointsPerSeries: number;
  oldSeries: Series;
  xDomain?: Domain;
  yDomain?: Domain;
};
export type LoaderResponse = { data: Datapoint[] };
export type LoaderFunc = (loaderProps: LoaderProps) => LoaderResponse;
export type ValueFunc = (pointIndex: number, pointCount: number) => number;
