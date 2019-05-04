import * as React from 'react';
import { ItemId, AccessorFunction } from '../../external';
import Data from '../../context/Data';
import { Domain } from 'domain';
import { AxisPlacement } from '../AxisPlacement';

// TODO: Move this to DataProvider (and define it properly over there)
type LoaderFunction = (params: any) => any;

export interface Props {
  id: ItemId;
  collectionId?: ItemId;
  color?: string;
  drawLines?: boolean;
  drawPoints?: boolean;
  pointWidth?: number;
  strokeWidth?: number;
  hidden?: boolean;
  loader?: LoaderFunction;
  step?: boolean;
  zoomable?: boolean;
  name?: string;
  timeAccessor?: AccessorFunction;
  xAccessor?: AccessorFunction;
  x0Accessor?: AccessorFunction;
  x1Accessor?: AccessorFunction;
  yAccessor?: AccessorFunction;
  y0Accessor?: AccessorFunction;
  y1Accessor?: AccessorFunction;
  yDomain?: Domain;
  ySubDomain?: Domain;
  yAxisPlacement?: AxisPlacement;
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
  children,

  // Below are all of the series props.
  ...props
}) => {
  // This only happens once, when the component is first mounted.
  React.useEffect(() => {
    return registerSeries({
      id,
      collectionId,
      ...props,
    });
  }, []);

  // But whenever the component is updated, we want to update the series in the
  // DataProvider.
  React.useEffect(() => {
    return updateSeries({
      id,
      ...props,
    });
  }, [
    props.color,
    props.drawLines,
    props.drawPoints,
    props.pointWidth,
    props.strokeWidth,
    props.hidden,
    props.loader,
    props.step,
    props.zoomable,
    props.name,
    props.timeAccessor,
    props.xAccessor,
    props.x0Accessor,
    props.x1Accessor,
    props.yAccessor,
    props.y0Accessor,
    props.y1Accessor,
    props.yDomain,
    props.ySubDomain,
    props.yAxisPlacement,
  ]);
  return null;
};

export default (props: Props) => (
  <Data.Consumer>
    {({ registerSeries, updateSeries }: InternalProps) => (
      <Series
        {...props}
        registerSeries={registerSeries}
        updateSeries={updateSeries}
      />
    )}
  </Data.Consumer>
);
