import React from 'react';
import PropTypes from 'prop-types';
import ScalerContext from '../../context/Scaler';
import GriffPropTypes, { seriesPropType } from '../../utils/proptypes';
import { createYScale, createXScale } from '../../utils/scale-helpers';
import Axes from '../../utils/Axes';

const propTypes = {
  axes: PropTypes.shape({
    x: PropTypes.oneOf(['x', 'time']),
  }),
  color: GriffPropTypes.grid.color,
  opacity: GriffPropTypes.grid.opacity,
  strokeWidth: GriffPropTypes.grid.strokeWidth,
  x: GriffPropTypes.grid.x,
  y: GriffPropTypes.grid.y,

  // These are all populated by Griff.
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  series: seriesPropType.isRequired,
  subDomainsByItemId: GriffPropTypes.subDomainsByItemId.isRequired,
};

const defaultProps = {
  axes: { x: 'x' },
  grid: null,
};

const DEFAULT_COLOR = '#666';
const DEFAULT_OPACITY = 0.6;
const DEFAULT_STROKE_WIDTH = 1;

const GridLines = ({
  axes,
  color,
  height,
  opacity,
  series,
  strokeWidth,
  subDomainsByItemId,
  width,
  x,
  y,
}) => {
  if (!x && !y) {
    return null;
  }

  const lines = [];

  if (y) {
    if (y.seriesIds) {
      const seriesIdMap = y.seriesIds.reduce(
        (dict, id) => ({ ...dict, [id]: true }),
        {}
      );
      series
        .filter(s => seriesIdMap[s.id])
        .forEach(s => {
          // This is heavily inspired by YAxis -- maybe we could consolidate?
          const scale = createYScale(Axes.y(subDomainsByItemId[s.id]), height);
          const nTicks = y.count || Math.floor(height / 50) || 1;
          const values = scale.ticks(nTicks);

          values.forEach(v => {
            lines.push(
              <line
                key={`horizontal-${s.id}-${v}`}
                className="grid-line grid-line-horizontal"
                opacity={y.opacity || opacity || DEFAULT_OPACITY}
                stroke={
                  y.color === null ? s.color : y.color || color || DEFAULT_COLOR
                }
                strokeWidth={
                  y.strokeWidth || strokeWidth || DEFAULT_STROKE_WIDTH
                }
                x1={0}
                x2={width}
                y1={(y.strokeWidth || strokeWidth || DEFAULT_STROKE_WIDTH) / 2}
                y2={(y.strokeWidth || strokeWidth || DEFAULT_STROKE_WIDTH) / 2}
                transform={`translate(0, ${scale(v)})`}
              />
            );
          });
        });
    } else if (y.pixels) {
      for (
        let position = (height % y.pixels) / 2;
        position <= height;
        position += y.pixels
      ) {
        lines.push(
          <line
            key={`horizontal-${position}`}
            className="grid-line grid-line-horizontal"
            x1={0}
            x2={width}
            y1={position}
            y2={position}
            stroke={y.color || color || DEFAULT_COLOR}
            strokeWidth={y.strokeWidth || strokeWidth || DEFAULT_STROKE_WIDTH}
            opacity={y.opacity || opacity || DEFAULT_OPACITY}
          />
        );
      }
    } else if (y.count) {
      const interval = height / y.count;
      for (
        let position = interval / 2;
        position <= height;
        position += interval
      ) {
        lines.push(
          <line
            key={`horizontal-${position}`}
            className="grid-line grid-line-horizontal"
            x1={0}
            x2={width}
            y1={position}
            y2={position}
            stroke={y.color || color || DEFAULT_COLOR}
            strokeWidth={y.strokeWidth || strokeWidth || DEFAULT_STROKE_WIDTH}
            opacity={y.opacity || opacity || DEFAULT_OPACITY}
          />
        );
      }
    }
  }

  if (x) {
    if (x.pixels) {
      for (
        let position = (width % x.pixels) / 2;
        position <= width;
        position += x.pixels
      ) {
        lines.push(
          <line
            key={`vertical-${position}`}
            className="grid-line grid-line-vertical"
            y1={0}
            y2={height}
            x1={position}
            x2={position}
            stroke={x.color || color || DEFAULT_COLOR}
            strokeWidth={x.strokeWidth || strokeWidth || DEFAULT_STROKE_WIDTH}
            opacity={x.opacity || opacity || DEFAULT_OPACITY}
          />
        );
      }
    } else if (x.ticks !== undefined) {
      // This heavily inspired by XAxis -- maybe we can consolidate them?
      // FIXME: Remove this when we support multiple X axes
      const timeSubDomain =
        subDomainsByItemId[Object.keys(subDomainsByItemId)[0]][axes.x];
      const scale = createXScale(timeSubDomain, width);
      const values = scale.ticks(x.ticks || Math.floor(width / 100) || 1);
      values.forEach(v => {
        lines.push(
          <line
            key={`vertical-${+v}`}
            className="grid-line grid-line-vertical"
            opacity={x.opacity || opacity || DEFAULT_OPACITY}
            stroke={x.color || color || DEFAULT_COLOR}
            strokeWidth={x.strokeWidth || strokeWidth || DEFAULT_STROKE_WIDTH}
            y1={0}
            y2={height}
            x1={(x.strokeWidth || strokeWidth || DEFAULT_STROKE_WIDTH) / 2}
            x2={(x.strokeWidth || strokeWidth || DEFAULT_STROKE_WIDTH) / 2}
            transform={`translate(${scale(v)}, 0)`}
          />
        );
      });
    } else if (x.count) {
      const interval = width / x.count;
      for (
        let position = interval / 2;
        position <= width;
        position += interval
      ) {
        lines.push(
          <line
            key={`vertical-${position}`}
            className="grid-line grid-line-vertical"
            y1={0}
            y2={height}
            x1={position}
            x2={position}
            stroke={x.color || color || DEFAULT_COLOR}
            strokeWidth={x.strokeWidth || strokeWidth || DEFAULT_STROKE_WIDTH}
            opacity={x.opacity || opacity || DEFAULT_OPACITY}
          />
        );
      }
    }
  }

  return lines;
};

GridLines.propTypes = propTypes;
GridLines.defaultProps = defaultProps;

export default props => (
  <ScalerContext.Consumer>
    {({ series, subDomainsByItemId }) => (
      <GridLines
        {...props}
        series={series}
        subDomainsByItemId={subDomainsByItemId}
      />
    )}
  </ScalerContext.Consumer>
);
