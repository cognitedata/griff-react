import React from 'react';
import PropTypes from 'prop-types';
import ScalerContext from '../../context/Scaler';
import { gridPropType, seriesPropType } from '../../utils/proptypes';
import { createYScale, createXScale } from '../../utils/scale-helpers';

const propTypes = {
  grid: gridPropType,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  series: seriesPropType.isRequired,
  subDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
};

const defaultProps = {
  grid: null,
};

const DEFAULT_COLOR = '#666';
const DEFAULT_OPACITY = 0.6;
const DEFAULT_STROKE_WIDTH = 1;

class GridLines extends React.Component {
  state = {};
  render() {
    const { grid, height, width, series, subDomain } = this.props;

    if (!grid) {
      return null;
    }

    const { x, y } = grid;
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
        series.filter(s => seriesIdMap[s.id]).forEach(s => {
          // This is heavily inspired by YAxis -- maybe we could consolidate?
          const scale = createYScale(s.yDomain, height);
          const nTicks = y.count || Math.floor(height / 50) || 1;
          const values = scale.ticks(nTicks);

          values.forEach(v => {
            lines.push(
              <line
                key={`horizontal-${s.id}-${v}`}
                opacity={y.opacity || grid.opacity || DEFAULT_OPACITY}
                stroke={
                  y.color === null
                    ? s.color
                    : y.color || grid.color || DEFAULT_COLOR
                }
                strokeWidth={
                  y.strokeWidth || grid.strokeWidth || DEFAULT_STROKE_WIDTH
                }
                x1={0}
                x2={width}
                y1={
                  (y.strokeWidth || grid.strokeWidth || DEFAULT_STROKE_WIDTH) /
                  2
                }
                y2={
                  (y.strokeWidth || grid.strokeWidth || DEFAULT_STROKE_WIDTH) /
                  2
                }
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
              x1={0}
              x2={width}
              y1={position}
              y2={position}
              stroke={y.color || grid.color || DEFAULT_COLOR}
              strokeWidth={
                y.strokeWidth || grid.strokeWidth || DEFAULT_STROKE_WIDTH
              }
              opacity={y.opacity || grid.opacity || DEFAULT_OPACITY}
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
              x1={0}
              x2={width}
              y1={position}
              y2={position}
              stroke={y.color || grid.color || DEFAULT_COLOR}
              strokeWidth={
                y.strokeWidth || grid.strokeWidth || DEFAULT_STROKE_WIDTH
              }
              opacity={y.opacity || grid.opacity || DEFAULT_OPACITY}
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
              y1={0}
              y2={height}
              x1={position}
              x2={position}
              stroke={x.color || grid.color || DEFAULT_COLOR}
              strokeWidth={
                x.strokeWidth || grid.strokeWidth || DEFAULT_STROKE_WIDTH
              }
              opacity={x.opacity || grid.opacity || DEFAULT_OPACITY}
            />
          );
        }
      } else if (x.ticks !== undefined) {
        // This heavily inspired by XAxis -- maybe we can consolidate them?
        const scale = createXScale(subDomain, width);
        const values = scale.ticks(x.ticks || Math.floor(width / 100) || 1);
        values.forEach(v => {
          lines.push(
            <line
              key={`vertical-${+v}`}
              opacity={x.opacity || grid.opacity || DEFAULT_OPACITY}
              stroke={x.color || grid.color || DEFAULT_COLOR}
              strokeWidth={
                x.strokeWidth || grid.strokeWidth || DEFAULT_STROKE_WIDTH
              }
              y1={0}
              y2={height}
              x1={
                (x.strokeWidth || grid.strokeWidth || DEFAULT_STROKE_WIDTH) / 2
              }
              x2={
                (x.strokeWidth || grid.strokeWidth || DEFAULT_STROKE_WIDTH) / 2
              }
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
              y1={0}
              y2={height}
              x1={position}
              x2={position}
              stroke={x.color || grid.color || DEFAULT_COLOR}
              strokeWidth={
                x.strokeWidth || grid.strokeWidth || DEFAULT_STROKE_WIDTH
              }
              opacity={x.opacity || grid.opacity || DEFAULT_OPACITY}
            />
          );
        }
      }
    }

    return lines;
  }
}

GridLines.propTypes = propTypes;
GridLines.defaultProps = defaultProps;

export default props => (
  <ScalerContext.Consumer>
    {({ series, subDomain, yTransformations }) => (
      <GridLines
        {...props}
        series={series}
        subDomain={subDomain}
        yTransformations={yTransformations}
      />
    )}
  </ScalerContext.Consumer>
);
