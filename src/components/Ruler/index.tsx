import * as React from 'react';
import RulerTooltip from '../RulerTooltip';
import { ItemId } from '../../external';

export interface RulerConfig {
  visible: boolean;
  timeLabel: (data: RulerPoint) => string;
  yLabel: (data: RulerPoint) => string;
  getTimeLabelPosition?: (
    defaultPosition: number,
    measurements: {
      height: number;
      labelHeight: number;
      timeLabelMargin: number;
    }
  ) => number;
}

export interface RulerPoint {
  id?: ItemId;
  name: string;
  color: string;
  timestamp: number;
  value: number | string;
  x: number;
  y: number;
}

export interface Props {
  chartWidth: number;
  chartHeight: number;
  points: RulerPoint[];
  ruler: RulerConfig;
}

const labelHeight = 24;

const calculateY = (points: RulerPoint[], yTooltipPosition: number) => {
  const pointsObject: { [name: string]: number } = {};

  const pointsSorted = [...points].sort((a, b) => a.y - b.y);

  let prevPoint;
  for (let i = 0; i < pointsSorted.length; i += 1) {
    const realSpace = yTooltipPosition - pointsSorted[i].y;
    const neededSpace = (pointsSorted.length - i) * labelHeight;

    // move point upper if no space until the limit available
    if (realSpace < neededSpace) {
      const pointPos = yTooltipPosition - neededSpace;
      // if no upper room available stick it to 0
      prevPoint = pointPos >= 0 ? pointPos : 0;
      // move point lower if it overlaps the previous one
    } else if (
      prevPoint !== undefined &&
      prevPoint + labelHeight > pointsSorted[i].y
    ) {
      prevPoint += labelHeight;
    } else {
      prevPoint = pointsSorted[i].y;
    }
    pointsObject[pointsSorted[i].name] = prevPoint;
  }

  return pointsObject;
};

const Ruler: React.FunctionComponent<Props> = ({
  ruler,
  points,
  chartHeight,
  chartWidth,
}) => {
  const {
    visible = true,
    timeLabel = ({ timestamp }: RulerPoint) => String(new Date(timestamp)),
    yLabel = ({ value }: RulerPoint) => String(value),
    getTimeLabelPosition = (defaultTimeTooltipPosition: number) =>
      defaultTimeTooltipPosition,
  } = ruler;
  if (!visible) {
    return null;
  }

  const xScale = (x: number) => x;

  const timeLabelMargin = 5;
  const defaultTimeTooltipPosition =
    chartHeight - labelHeight - 2 * timeLabelMargin;
  const metadata = { height: chartHeight, labelHeight, timeLabelMargin };
  // The fixed position of a x-axis label which is the same for all highlighted points
  const timeTooltipPosition = getTimeLabelPosition
    ? getTimeLabelPosition(defaultTimeTooltipPosition, metadata)
    : defaultTimeTooltipPosition;
  const pointsObject = calculateY(points, timeTooltipPosition);
  const newestPoint = points.reduce((newest, current) => {
    if (current.timestamp > newest.timestamp) {
      return current;
    }
    return newest;
  }, points[0]);

  const positionX = xScale(newestPoint.x);
  return (
    <>
      <line
        className="ruler-line"
        y1={0}
        y2={chartHeight}
        stroke="#ccc"
        strokeWidth="1"
        x1={positionX}
        x2={positionX}
      />
      <RulerTooltip
        labelHeight={labelHeight}
        color={newestPoint.color}
        label={timeLabel(newestPoint)}
        x={positionX}
        y={timeTooltipPosition}
        chartWidth={chartWidth}
      />
      {points.map(point => [
        <RulerTooltip
          key={point.name || point.y}
          labelHeight={labelHeight}
          color={point.color}
          label={yLabel(point)}
          x={xScale(point.x)}
          y={pointsObject[point.name] - labelHeight / 2}
          chartWidth={chartWidth}
        />,
        <circle
          key={`circle${point.name || point.y}`}
          className="ruler-circle"
          r={3}
          cx={xScale(point.x)}
          cy={point.y}
          fill={point.color}
          stroke={point.color}
          strokeWidth="3"
          strokeOpacity="0.5"
        />,
      ])}
    </>
  );
};

export default Ruler;
