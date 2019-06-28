import * as React from 'react';
import { ItemProps, WATCHED_PROP_NAMES, Props as SeriesProps } from '../Series';
import { withDisplayName } from '../../utils/displayName';
import { RegisterCollectionFunction, UpdateCollectionFunction } from '../Griff';
import { Context as GriffContext } from '../Griff';

export interface Props extends ItemProps {
  children?: JSX.Element | JSX.Element[];
}

interface InternalProps {
  registerCollection: RegisterCollectionFunction;
  updateCollection: UpdateCollectionFunction;
}

// @ts-ignore - I don't know how to make TypeScript happy about ...props
const Collection: React.FunctionComponent<Props & InternalProps> = ({
  id,

  registerCollection,
  updateCollection,
  children,

  ...props
}) => {
  React.useEffect(() => {
    return registerCollection({
      id,
      ...props,
    });
  }, []);

  React.useEffect(() => {
    return updateCollection({
      id,
      ...props,
    });
    // @ts-ignore - It's okay for props[name] to be implicit any.
  }, WATCHED_PROP_NAMES.map(name => props[name]));

  if (React.Children.count(children) === 0) {
    return null;
  }

  return React.Children.map(children, child => {
    if (!child || !React.isValidElement(child)) {
      return null;
    }
    return React.cloneElement(child as React.ReactElement<SeriesProps>, {
      ...child.props,
      collectionId: id,
    });
  });
};

export default withDisplayName('Collection', (props: Props) => (
  <GriffContext.Consumer>
    {({ registerCollection, updateCollection }: InternalProps) => (
      <Collection
        registerCollection={registerCollection}
        updateCollection={updateCollection}
        {...props}
      >
        {props.children}
      </Collection>
    )}
  </GriffContext.Consumer>
));
