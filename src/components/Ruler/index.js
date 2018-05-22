import React from 'react';
import PropTypes from 'prop-types';
import RulerTooltip from '../RulerTooltip';

const propTypes = {
  contextWidth: PropTypes.number.isRequired,
  effectiveHeight: PropTypes.number.isRequired,
  colors: PropTypes.objectOf(PropTypes.string).isRequired,
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
    pointsObject[pointsSorted[i].key] = prevPoint;
  }

  return pointsObject;
};

const Ruler = ({ ruler, points, colors, effectiveHeight, contextWidth }) => {
  const yLabelHeight = effectiveHeight - labelHeight - 5;
  const pointsObject = calculateY(points, yLabelHeight);
  const firstPoint = points[0];

  return (
    <React.Fragment>
      <line
        y1={0}
        y2={effectiveHeight}
        stroke="#ccc"
        strokeWidth="1"
        x1={firstPoint.x}
        x2={firstPoint.x}
      />
      <RulerTooltip
        labelHeight={labelHeight}
        color={colors[firstPoint.key]}
        label={ruler.xLabel(firstPoint)}
        x={firstPoint.x}
        y={yLabelHeight}
        contextWidth={contextWidth}
      />
      {points.map(point => [
        <RulerTooltip
          key={point.key}
          labelHeight={labelHeight}
          color={colors[point.key]}
          label={ruler.yLabel(point)}
          x={point.x}
          y={pointsObject[point.key] - labelHeight / 2}
          contextWidth={contextWidth}
        />,
        <circle
          key={`circle${point.key}`}
          r={3}
          cx={point.x}
          cy={point.y}
          fill={colors[point.key]}
          stroke={colors[point.key]}
          strokeWidth="3"
          strokeOpacity="0.5"
        />,
      ])};
    </React.Fragment>
  );
};

Ruler.propTypes = propTypes;

export default Ruler;
