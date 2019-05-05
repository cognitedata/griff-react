import * as React from 'react';
import { ItemId, AccessorFunction, PointRenderer } from '../../external';
import Data from '../../context/Data';
import { Domain } from 'domain';
import { AxisPlacement } from '../AxisPlacement';
import { AxisDisplayMode } from '../../utils/AxisDisplayMode';

// TODO: Move this to DataProvider (and define it properly over there)
type LoaderFunction = (params: any) => any;

export interface ItemProps {
  color?: string;
  drawLines?: boolean;
  drawPoints?: boolean | PointRenderer;
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
  yAxisDisplayMode?: AxisDisplayMode;
  pointWidthAccessor?: AccessorFunction;
  opacity?: number;
  opacityAccessor?: AccessorFunction;
}

export const WATCHED_PROP_NAMES = [
  'color',
  'drawLines',
  'drawPoints',
  'pointWidth',
  'strokeWidth',
  'hidden',
  'loader',
  'step',
  'zoomable',
  'name',
  'timeAccessor',
  'xAccessor',
  'x0Accessor',
  'x1Accessor',
  'yAccessor',
  'y0Accessor',
  'y1Accessor',
  'yDomain',
  'ySubDomain',
  'yAxisPlacement',
  'yAxisDisplayMode',
  'pointWidthAccessor',
  'opacity',
  'opacityAccessor',
];

export interface Props extends ItemProps {
  id: ItemId;
  collectionId?: ItemId;
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
    // @ts-ignore
  }, WATCHED_PROP_NAMES.map(name => props[name]).concat(props.collectionId));
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
