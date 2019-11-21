import { Datapoint, Domain } from 'external';

export type LoaderProps = {
  timeDomain: Domain;
};
export type LoaderResponse = { data: Datapoint[] };
export type LoaderFunc = (loaderProps: LoaderProps) => LoaderResponse;
export type ValueFunc = (pointIndex: number, pointCount: number) => number;
