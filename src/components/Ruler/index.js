import React from 'react';
import PropTypes from 'prop-types';
import RulerTooltip from '../RulerTooltip';
import { pointPropType, rulerPropType } from '../../utils/proptypes';

const propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  points: PropTypes.arrayOf(pointPropType).isRequired,
  ruler: rulerPropType.isRequired,
};

const labelHeight = 24;

const calculateY = (points, y) => {
  const pointsObject = {};

  const pointsSorted = [...points].sort((a, b) => {
    if (a.y < b.y) return -1;
    if (a.y > b.y) return 1;
    return 0;
  });

  let prevPoint;
  for (let i = 0; i < pointsSorted.length; i += 1) {
    const realSpace = y - pointsSorted[i].y;
    const neededSpace = (pointsSorted.length - i) * labelHeight;

    // move point upper if no space until the limit available
    if (realSpace < neededSpace) {
      const pointPos = y - neededSpace;
      // if no upper room available stick it to 0
      prevPoint = pointPos >= 0 ? pointPos : 0;
      // move point lower if it overlaps the previous one
    } else if (prevPoint + labelHeight > pointsSorted[i].y) {
      prevPoint += labelHeight;
    } else {
      prevPoint = pointsSorted[i].y;
    }
    pointsObject[pointsSorted[i].name] = prevPoint;
  }

  return pointsObject;
};

const Ruler = ({ ruler, points, height, width }) => {
  const yLabelHeight = height - labelHeight - 5;
  const pointsObject = calculateY(points, yLabelHeight);
  const firstPoint = points[0];

  return (
    <React.Fragment>
      <line
        y1={0}
        y2={height}
        stroke="#ccc"
        strokeWidth="1"
        x1={firstPoint.x}
        x2={firstPoint.x}
      />
      <RulerTooltip
        labelHeight={labelHeight}
        color={firstPoint.color}
        label={ruler.xLabel(firstPoint)}
        x={firstPoint.x}
        y={yLabelHeight}
        width={width}
      />
      {points.map(point => [
        <RulerTooltip
          key={point.name}
          labelHeight={labelHeight}
          color={point.color}
          label={ruler.yLabel(point)}
          x={point.x}
          y={pointsObject[point.name] - labelHeight / 2}
          width={width}
        />,
        <circle
          key={`circle${point.name}`}
          r={3}
          cx={point.x}
          cy={point.y}
          fill={point.color}
          stroke={point.color}
          strokeWidth="3"
          strokeOpacity="0.5"
        />,
      ])};
    </React.Fragment>
  );
};

Ruler.propTypes = propTypes;

export default Ruler;
