import React from 'react';
import * as d3 from 'd3';
import { createYScale } from 'utils/scale-helpers';
import AxisPlacements, { AxisPlacement } from 'components/AxisPlacement';

const getPath = (
  offsetx: number,
  strokeWidth: number,
  tickSizeOuter: number,
  range: number[],
  yAxisPlacement: AxisPlacement,
  width: number
) => {
  switch (yAxisPlacement) {
    case AxisPlacements.LEFT:
      return [
        // Move to this (x,y); start drawing
        `M ${width - offsetx} ${strokeWidth}`,
        // Draw a horizontal line to the left
        `h ${tickSizeOuter - strokeWidth}`,
        // Draw a vertical line from top to bottom
        `v ${range[0] - strokeWidth * 2}`,
        // Finish with another horizontal line
        `h -${tickSizeOuter - strokeWidth / 2}`,
      ].join(' ');
    case AxisPlacements.BOTH:
      throw new Error(
        'BOTH is not a valid option for CollapsedAxis -- please specify RIGHT or LEFT'
      );
    case AxisPlacements.RIGHT:
    case AxisPlacements.UNSPECIFIED:
    default:
      return [
        // Move to this (x,y); start drawing
        `M ${offsetx} ${strokeWidth}`,
        // Draw a horizontal line to the left
        `h -${tickSizeOuter - strokeWidth}`,
        // Draw a vertical line from top to bottom
        `v ${range[0] - strokeWidth * 2}`,
        // Finish with another horizontal line
        `h ${tickSizeOuter - strokeWidth / 2}`,
      ].join(' ');
  }
};

type Props = {
  height: number;
  width: number;
  offsetx: number;
  color: string;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  yAxisPlacement: AxisPlacement;
};

const CollapsedAxis = ({
  height,
  width,
  offsetx: initialOffsetX,
  color,
  onMouseEnter,
  onMouseLeave,
  yAxisPlacement,
}: Props) => {
  const renderAxis = () => {
    const scale = createYScale([0, 100], height);
    const axis = d3.axisRight(scale);
    const tickFontSize = 14;
    const strokeWidth = 2;
    const tickSizeOuter = axis.tickSizeOuter();
    const range = scale.range();
    const paths: {
      [k: number]: { path: string; color: string; opacity: number };
    } = {};
    let offsetx = 0;
    for (let i = 1; i < 4; i += 1) {
      offsetx += tickSizeOuter;
      paths[i] = {
        path: getPath(
          offsetx,
          strokeWidth,
          tickSizeOuter,
          range,
          yAxisPlacement,
          width
        ),
        color,
        opacity: 1 - (i - 1) / 4,
      };

      offsetx += 3;
    }
    return (
      <g
        className="axis"
        fill="none"
        fontSize={tickFontSize}
        textAnchor="start"
        strokeWidth={strokeWidth}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {Object.keys(paths).map(key => (
          <path
            key={key}
            stroke={paths[+key].color}
            opacity={paths[+key].opacity || 1}
            d={paths[+key].path}
          />
        ))}
      </g>
    );
  };

  return (
    <g
      className="axis-y collapsed-axis-y"
      transform={`translate(${initialOffsetX}, 0)`}
    >
      {renderAxis()}
    </g>
  );
};

export default CollapsedAxis;
