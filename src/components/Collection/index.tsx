import * as React from 'react';
import Data from '../../context/Data';
import { ItemId, Domain } from '../../external';

export interface Props {
  id: ItemId;

  color?: string;
  drawPoints?: boolean;
  pointWidth?: number;
  strokeWidth?: number;
  ySubDomain?: Domain;
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

  color,
  drawPoints,
  pointWidth,
  strokeWidth,
  ySubDomain,
}) => {
  React.useEffect(() => {
    return registerCollection({
      id,
      color,
      drawPoints,
      pointWidth,
      strokeWidth,
      ySubDomain,
    });
  }, []);

  React.useEffect(() => {
    return updateCollection({
      id,
      color,
      drawPoints,
      pointWidth,
      strokeWidth,
      ySubDomain,
    });
  }, [color, drawPoints, pointWidth, strokeWidth, ySubDomain]);

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
