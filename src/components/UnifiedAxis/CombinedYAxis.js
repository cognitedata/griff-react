import React, { Component } from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import ScalerContext from '../../context/Scaler';
import { createYScale } from '../../utils/scale-helpers';
import GriffPropTypes, { seriesPropType } from '../../utils/proptypes';
import AxisPlacement from '../AxisPlacement';
import Axes from '../../utils/Axes';

const propTypes = {
  series: seriesPropType.isRequired,
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  color: PropTypes.string,
  ticks: PropTypes.number,
  // Number => String
  tickFormatter: PropTypes.func.isRequired,
  yAxisPlacement: GriffPropTypes.axisPlacement,

  // These are populated by Griff.
  subDomainsByItemId: GriffPropTypes.subDomainsByItemId.isRequired,
};

const defaultProps = {
  color: '#000',
  ticks: null,
  yAxisPlacement: AxisPlacement.RIGHT,
};

class CombinedYAxis extends Component {
  getDomain = seriesArray =>
    seriesArray.reduce(
      (domain, series) => [
        Math.min(
          domain[0],
          Axes.y(this.props.subDomainsByItemId[series.id])[0]
        ),
        Math.max(
          domain[1],
          Axes.y(this.props.subDomainsByItemId[series.id])[1]
        ),
      ],
      [Number.MAX_SAFE_INTEGER, Number.MIN_SAFE_INTEGER]
    );

  getLineProps = ({ tickSizeInner, strokeWidth }) => {
    const { width, yAxisPlacement } = this.props;
    switch (yAxisPlacement) {
      case AxisPlacement.LEFT:
        return {
          x1: width - strokeWidth,
          x2: width - strokeWidth - tickSizeInner,
          y1: strokeWidth / 2,
          y2: strokeWidth / 2,
        };
      case AxisPlacement.BOTH:
        throw new Error(
          'BOTH is not a valid option for YAxis -- please specify RIGHT or LEFT'
        );
      case AxisPlacement.RIGHT:
      case AxisPlacement.UNSPECIFIED:
      default:
        return {
          x1: 0,
          x2: tickSizeInner,
          y1: strokeWidth / 2,
          y2: strokeWidth / 2,
        };
    }
  };

  getPathString = ({ tickSizeOuter, range, strokeWidth }) => {
    const { yAxisPlacement, width } = this.props;
    switch (yAxisPlacement) {
      case AxisPlacement.LEFT:
        return [
          `M${width - tickSizeOuter},${range[0] - strokeWidth}`,
          `H${width - strokeWidth}`,
          `V${range[1]}`,
          `H${width - tickSizeOuter}`,
        ].join('');
      case AxisPlacement.BOTH:
        throw new Error(
          'BOTH is not a valid option for YAxis -- please specify RIGHT or LEFT'
        );
      case AxisPlacement.RIGHT:
      case AxisPlacement.UNSPECIFIED:
      default:
        return [
          // Move to this (x,y); start drawing
          `M${tickSizeOuter},${range[0] - strokeWidth}`,
          // Draw a horizontal line half strokeWidth long
          `H${strokeWidth / 2}`,
          // Draw a vertical line from bottom to top
          `V${range[1]}`,
          // Finish with another horizontal line
          `H${tickSizeOuter}`,
        ].join('');
    }
  };

  getTextAnchor = () => {
    const { yAxisPlacement } = this.props;
    switch (yAxisPlacement) {
      case AxisPlacement.LEFT:
        return 'end';
      case AxisPlacement.BOTH:
        throw new Error(
          'BOTH is not a valid option for YAxis -- please specify RIGHT or LEFT'
        );
      case AxisPlacement.RIGHT:
      case AxisPlacement.UNSPECIFIED:
      default:
        return 'start';
    }
  };

  getTextProps = ({ tickSizeInner, tickPadding, strokeWidth }) => {
    const { width, yAxisPlacement } = this.props;
    switch (yAxisPlacement) {
      case AxisPlacement.LEFT:
        return {
          x: Math.max(width - tickSizeInner, 0) - tickPadding,
          y: strokeWidth / 2,
        };
      case AxisPlacement.BOTH:
        throw new Error(
          'BOTH is not a valid option for YAxis -- please specify RIGHT or LEFT'
        );
      case AxisPlacement.RIGHT:
      case AxisPlacement.UNSPECIFIED:
      default:
        return {
          x: Math.max(tickSizeInner, 0) + tickPadding,
          y: strokeWidth / 2,
        };
    }
  };

  renderAxis() {
    const { series, height, color, ticks, tickFormatter } = this.props;
    const scale = createYScale(this.getDomain(series), height);
    const axis = d3.axisRight(scale);
    const tickFontSize = 14;
    const strokeWidth = 2;
    const halfStrokeWidth = strokeWidth / 2;
    const tickSizeOuter = axis.tickSizeOuter();
    const tickSizeInner = axis.tickSizeInner();
    const tickPadding = axis.tickPadding();
    // same as for xAxis but consider height of the screen ~two times smaller
    const nTicks = ticks || Math.floor(height / 50) || 1;
    const values = scale.ticks(nTicks);
    const range = scale.range().map(r => r + halfStrokeWidth);
    return (
      <g
        className="axis"
        fill="none"
        fontSize={tickFontSize}
        textAnchor={this.getTextAnchor()}
        strokeWidth={strokeWidth}
      >
        <path
          stroke={series.color || color}
          d={this.getPathString({ tickSizeOuter, range, strokeWidth })}
        />
        {values.map(v => {
          const lineProps = {
            stroke: series.color || color,
            ...this.getLineProps({ tickSizeInner, range, strokeWidth }),
          };

          const textProps = {
            fill: series.color || color,
            dy: '0.32em',
            ...this.getTextProps({ tickSizeInner, tickPadding, strokeWidth }),
          };
          return (
            <g key={+v} opacity={1} transform={`translate(0, ${scale(v)})`}>
              <line {...lineProps} />
              <text {...textProps}>{tickFormatter(v)}</text>
            </g>
          );
        })}
      </g>
    );
  }

  render() {
    // TODO: Get zooming to work.
    // Zooming a combined series doesn't work. Well, it works, but the zoom
    // state does not remain synced between the axis and the Scaler. I'm not
    // entirely sure what's going on (if I did, I'd fix it), so I'm just going
    // to omit axis zooming for now.
    // It's possible that the new collections interface can be used for this.
    return <g className="axis-y">{this.renderAxis()}</g>;
  }
}

CombinedYAxis.propTypes = propTypes;
CombinedYAxis.defaultProps = defaultProps;

export default props => (
  <ScalerContext.Consumer>
    {({ series, subDomainsByItemId }) => (
      <CombinedYAxis
        {...props}
        series={series}
        subDomainsByItemId={subDomainsByItemId}
      />
    )}
  </ScalerContext.Consumer>
);
