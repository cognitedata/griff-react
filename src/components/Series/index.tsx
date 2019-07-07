import * as React from 'react';
import { ItemId, DomainPriority } from '../../external';
import {
  Context as Griff,
  RegisterSeriesFunction,
  UpdateSeriesFunction,
} from '../Griff';
import { withDisplayName } from '../../utils/displayName';
import { IncomingItem } from '../../internal';
import { copyDomain } from '../../utils/domains';

export interface ItemProps extends IncomingItem {}

export const DOMAIN_PROP_NAMES = [
  'timeDomain',
  'timeSubDomain',
  'xDomain',
  'xSubDomain',
  'yDomain',
  'ySubDomain',
];

export const WATCHED_PROP_NAMES = [
  'color',
  'drawLines',
  'drawPoints',
  'hidden',
  'loader',
  'name',
  'opacity',
  'opacityAccessor',
  'pointWidth',
  'pointWidthAccessor',
  'step',
  'strokeWidth',
  'timeAccessor',
  'updateInterval',
  'x0Accessor',
  'x1Accessor',
  'xAccessor',
  'y0Accessor',
  'y1Accessor',
  'yAccessor',
  'yAxisDisplayMode',
  'yAxisPlacement',
  'zoomable',
  'zoomable',
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

  // Domains get special treatment :)
  React.useEffect(() => {
    const updates = DOMAIN_PROP_NAMES.reduce(
      (acc, name) => {
        // @ts-ignore - This is an acceptable implicit any.
        let domain = props[name];
        if (domain) {
          domain = copyDomain(domain, DomainPriority.SERIES);
        }
        return { ...acc, [name]: domain };
      },
      { id }
    );
    return updateSeries(updates);
    // @ts-ignore - This is okay for implicit any.
  }, DOMAIN_PROP_NAMES.map(name => props[name]));

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
