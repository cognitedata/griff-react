import * as React from 'react';
import {
  ItemId,
  AccessorFunction,
  PointRenderer,
  Domain,
  LoaderFunction,
} from '../../external';
import {
  Context as Griff,
  RegisterSeriesFunction,
  UpdateSeriesFunction,
} from '../Griff';
import { AxisPlacement } from '../AxisPlacement';
import { AxisDisplayMode } from '../../utils/AxisDisplayMode';
import { withDisplayName } from '../../utils/displayName';

export interface ItemProps {
  id: ItemId;
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
  xDomain?: Domain;
  xSubDomain?: Domain;
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
  collectionId?: ItemId;
}

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
    // @ts-ignore - It's okay for props[name] to be implicit any.
  }, WATCHED_PROP_NAMES.map(name => props[name]).concat(props.collectionId));
  return null;
};
(Series as any).griffDataItem = true;

export default withDisplayName('Series', (props: Props) => (
  <Griff.Consumer>
    {({ registerSeries, updateSeries }: InternalProps) => (
      <Series
        {...props}
        registerSeries={registerSeries}
        updateSeries={updateSeries}
      />
    )}
  </Griff.Consumer>
));
