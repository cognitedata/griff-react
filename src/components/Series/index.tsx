import * as React from 'react';
import { ItemId, AccessorFunction } from '../../external';
import Data from '../../context/Data';
import { Domain } from 'domain';

type LoaderFunction = (params: any) => any;

export interface Props {
  id: ItemId;
  collectionId?: ItemId;
  debug?: boolean;
  color?: string;
  drawPoints?: boolean;
  pointWidth?: number;
  strokeWidth?: number;
  hidden?: boolean;
  loader?: LoaderFunction;
  step?: boolean;

  timeAccessor?: AccessorFunction;
  xAccessor?: AccessorFunction;
  x0Accessor?: AccessorFunction;
  x1Accessor?: AccessorFunction;
  yAccessor?: AccessorFunction;
  y0Accessor?: AccessorFunction;
  y1Accessor?: AccessorFunction;
  yDomain?: Domain;
  ySubDomain?: Domain;
}

export type UnregisterSeriesFunction = () => void;

export type RegisterSeriesFunction = (
  seriesProps: Props
) => UnregisterSeriesFunction;

export type UpdateSeriesFunction = (seriesProps: Props) => void;

interface InternalProps {
  registerSeries: RegisterSeriesFunction;
  updateSeries: UpdateSeriesFunction;
}

const Series: React.FunctionComponent<Props & InternalProps> = ({
  id,
  collectionId,
  registerSeries,
  updateSeries,

  // Below are all of the series props.
  color,
  drawPoints,
  pointWidth,
  strokeWidth,
  yDomain,
  ySubDomain,
  hidden,
  loader,
  timeAccessor,
  xAccessor,
  x0Accessor,
  x1Accessor,
  yAccessor,
  y0Accessor,
  y1Accessor,
  step,
}) => {
  // This only happens once, when the component is first mounted.
  React.useEffect(() => {
    return registerSeries({
      id,
      collectionId,
      color,
      drawPoints,
      pointWidth,
      strokeWidth,
      yDomain,
      ySubDomain,
      hidden,
      loader,
      timeAccessor,
      xAccessor,
      x0Accessor,
      x1Accessor,
      yAccessor,
      y0Accessor,
      y1Accessor,
      step,
    });
  }, []);

  // But whenever the component is updated, we want to update the series in the
  // DataProvider.
  React.useEffect(() => {
    return updateSeries({
      id,
      color,
      drawPoints,
      pointWidth,
      strokeWidth,
      yDomain,
      ySubDomain,
      hidden,
      loader,
      timeAccessor,
      xAccessor,
      x0Accessor,
      x1Accessor,
      yAccessor,
      y0Accessor,
      y1Accessor,
      step,
    });
  }, [
    color,
    drawPoints,
    pointWidth,
    strokeWidth,
    hidden,
    loader,
    timeAccessor,
    xAccessor,
    x0Accessor,
    x1Accessor,
    yAccessor,
    y0Accessor,
    y1Accessor,
    step,
  ]);
  return null;
};

export default (props: Props) => (
  <Data.Consumer>
    {({ registerSeries, updateSeries }: InternalProps) => (
      <Series
        // These need to come before the props so that Collection can replace
        // them to make the magical linking work.
        registerSeries={registerSeries}
        updateSeries={updateSeries}
        {...props}
      />
    )}
  </Data.Consumer>
);
