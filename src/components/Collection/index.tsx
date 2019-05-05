import * as React from 'react';
import Data from '../../context/Data';
import {
  ItemId,
  Domain,
  AccessorFunction,
  PointRenderer,
} from '../../external';
import { AxisPlacement } from '../AxisPlacement';
import { AxisDisplayMode } from '../../utils/AxisDisplayMode';

export interface Props {
  id: ItemId;
  color?: string;
  drawLines?: boolean;
  drawPoints?: boolean | PointRenderer;
  pointWidth?: number;
  strokeWidth?: number;
  hidden?: boolean;
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
  }, [
    props.color,
    props.drawLines,
    props.drawPoints,
    props.pointWidth,
    props.strokeWidth,
    props.hidden,
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
    props.yAxisDisplayMode,
  ]);

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
