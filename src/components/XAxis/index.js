import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { SizeMe } from 'react-sizeme';
import GriffPropTypes, { scalerFactoryFunc } from '../../utils/proptypes';
import AxisPlacement from '../AxisPlacement';
import ScalerContext from '../../context/Scaler';

const tickTransformer = v => `translate(${v}, 0)`;

const propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  stroke: PropTypes.string,
  // Number => String
  tickFormatter: PropTypes.func,
  ticks: PropTypes.number,
  placement: GriffPropTypes.axisPlacement,
  scaled: PropTypes.bool,

  // These are provided by Griff.
  xScalerFactory: scalerFactoryFunc.isRequired,
  domainsByItemId: GriffPropTypes.domainsByItemId.isRequired,
  subDomainsByItemId: GriffPropTypes.subDomainsByItemId.isRequired,
};

const defaultProps = {
  stroke: 'black',
  width: 1,
  height: 50,
  ticks: 0,
  placement: AxisPlacement.BOTTOM,
  tickFormatter: Number,
  scaled: true,
};

class XAxis extends Component {
  getLineProps = ({ tickSizeInner, strokeWidth }) => {
    const { height, placement } = this.props;
    switch (placement) {
      case AxisPlacement.TOP:
        return {
          x1: strokeWidth / 2,
          x2: strokeWidth / 2,
          y1: height - tickSizeInner,
          y2: height,
        };
      case AxisPlacement.BOTTOM:
      case AxisPlacement.UNSPECIFIED:
      default:
        return {
          x1: strokeWidth / 2,
          x2: strokeWidth / 2,
          y2: tickSizeInner,
        };
    }
  };

  getPathString = ({ range, strokeWidth, tickSizeOuter }) => {
    const { height, placement } = this.props;
    switch (placement) {
      case AxisPlacement.TOP:
        return [
          `M${range[0]},${height - tickSizeOuter}`,
          `V${height - strokeWidth / 2}`,
          `H${range[1] - strokeWidth}`,
          `V${height - tickSizeOuter}`,
        ].join('');
      case AxisPlacement.BOTTOM:
      case AxisPlacement.UNSPECIFIED:
      default:
        return [
          `M${range[0]},${tickSizeOuter}`,
          `V${strokeWidth / 2}`,
          `H${range[1] - strokeWidth}`,
          `V${tickSizeOuter}`,
        ].join('');
    }
  };

  getTextProps = ({ tickSizeInner, tickPadding, strokeWidth }) => {
    const { height, placement } = this.props;
    switch (placement) {
      case AxisPlacement.TOP:
        return {
          y: height - (Math.max(tickSizeInner, 0) + tickPadding) - 10,
          x: strokeWidth / 2,
        };
      case AxisPlacement.BOTTOM:
      case AxisPlacement.UNSPECIFIED:
      default:
        return {
          y: Math.max(tickSizeInner, 0) + tickPadding,
          x: strokeWidth / 2,
        };
    }
  };

  renderAxis() {
    const {
      width,
      stroke,
      xScalerFactory,
      tickFormatter,
      ticks,
      domainsByItemId,
      subDomainsByItemId,
      scaled,
    } = this.props;
    const scale = xScalerFactory(
      (scaled ? subDomainsByItemId : domainsByItemId)[
        Object.keys(domainsByItemId)[0]
      ].x,
      width
    );
    const axis = d3.axisBottom(scale);
    const tickFontSize = 14;
    const strokeWidth = 2;
    const halfStrokeWidth = strokeWidth / 2;
    const tickSizeOuter = axis.tickSizeOuter();
    const tickSizeInner = axis.tickSizeInner();
    const tickPadding = axis.tickPadding();
    // In order to reduce label overlapping for smaller devices
    // we want to adjust amount of ticks depending on width.
    // Default amount of ticks is 10 which is sutable for a
    // regular 1280 display. So by dividing width by ~100
    // we can achieve appropriate amount of ticks for any width.
    const values = scale.ticks(ticks || Math.floor(width / 100) || 1);
    const range = scale.range().map(r => r + halfStrokeWidth);
    const pathString = this.getPathString({
      range,
      strokeWidth,
      tickSizeOuter,
    });
    return (
      <g
        className="axis x-axis"
        fill="none"
        fontSize={tickFontSize}
        textAnchor="middle"
        strokeWidth={strokeWidth}
      >
        <path stroke={stroke} d={pathString} />
        {values.map(v => {
          const lineProps = {
            stroke,
            ...this.getLineProps({ strokeWidth, tickSizeInner }),
          };

          const textProps = {
            fill: stroke,
            dy: '0.71em',
            ...this.getTextProps({ strokeWidth, tickPadding, tickSizeInner }),
          };
          return (
            <g key={+v} opacity={1} transform={tickTransformer(scale(v))}>
              <line stroke={stroke} {...lineProps} />
              <text className="tick-value" {...textProps}>
                {tickFormatter(v)}
              </text>
            </g>
          );
        })}
      </g>
    );
  }

  render() {
    const { width, height } = this.props;
    return (
      <svg
        width={width}
        style={{ width: '100%', display: 'block' }}
        height={height}
      >
        {this.renderAxis()}
      </svg>
    );
  }
}

XAxis.propTypes = propTypes;
XAxis.defaultProps = defaultProps;

export default props => (
  <ScalerContext.Consumer>
    {({ xScalerFactory, domainsByItemId, subDomainsByItemId }) => (
      <SizeMe monitorWidth>
        {({ size }) => (
          <XAxis
            xScalerFactory={xScalerFactory}
            {...props}
            width={size.width}
            domainsByItemId={domainsByItemId}
            subDomainsByItemId={subDomainsByItemId}
          />
        )}
      </SizeMe>
    )}
  </ScalerContext.Consumer>
);
