import * as React from 'react';
import { ItemId } from '../../external';
import Data from '../../context/Data';

export interface Props {
  id: ItemId;
  debug?: boolean;
  color?: string;
  drawPoints?: boolean;
  pointWidth?: number;
  strokeWidth?: number;
}

type UnregisterSeriesFunction = () => void;

type RegisterSeriesFunction = (seriesProps: Props) => UnregisterSeriesFunction;

type UpdateSeriesFunction = (seriesProps: Props) => void;

interface InternalProps {
  registerSeries: RegisterSeriesFunction;
  updateSeries: UpdateSeriesFunction;
}

const Series: React.FunctionComponent<Props & InternalProps> = ({
  id,
  debug = true,
  registerSeries,
  updateSeries,

  // Below are all of the series props.
  color,
  drawPoints,
  pointWidth,
  strokeWidth,
}) => {
  // This only happens once, when the component is first mounted.
  React.useEffect(() => {
    return registerSeries({
      id,
      color,
      drawPoints,
      pointWidth,
      strokeWidth,
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
    });
  }, [color, drawPoints, pointWidth, strokeWidth]);
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
