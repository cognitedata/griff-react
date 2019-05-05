import * as React from 'react';
import Data from '../../context/Data';
import { ItemProps, WATCHED_PROP_NAMES } from '../Series';
import { ItemId } from '../../external';

export interface Props extends ItemProps {
  id: ItemId;
}

type UnregisterCollectionFunction = () => void;

type RegisterCollectionFunction = (
  collectionProps: Props
) => UnregisterCollectionFunction;

type UpdateCollectionFunction = (collectionProps: Props) => void;

interface InternalProps {
  registerCollection: RegisterCollectionFunction;
  updateCollection: UpdateCollectionFunction;
  children: React.ReactNode[];
}

// @ts-ignore
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
  }, WATCHED_PROP_NAMES.map(name => props[name]));

  return React.Children.map(children, child => {
    if (!child) {
      return null;
    }
    // @ts-ignore
    return React.cloneElement(child, {
      // @ts-ignore
      ...child.props,
      collectionId: id,
    });
  });
};

export default (props: Props) => (
  <Data.Consumer>
    {({ registerCollection, updateCollection }: InternalProps) => (
      <Collection
        registerCollection={registerCollection}
        updateCollection={updateCollection}
        {...props}
      >
        {
          // @ts-ignore
          props.children
        }
      </Collection>
    )}
  </Data.Consumer>
);
