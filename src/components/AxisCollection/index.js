import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import YAxis from './YAxis';

class AxisCollection extends React.Component {
  static propTypes = {
    series: PropTypes.object,
    zoomable: PropTypes.bool,
    updateYScale: PropTypes.func,
    offsetx: PropTypes.number,
    offsety: PropTypes.number,
    rescaleY: PropTypes.func,
  };

  static defaultProps: {
    series: [],
    zoomable: true,
    updateYScale: () => {},
    offsetx: 0,
    offsety: 0,
  };

  renderAxes() {
    const { series, zoomable, height, updateYScale } = this.props;
    let axisOffsetX = 0;
    return Object.keys(series)
      .filter(key => !series[key].hidden)
      .map((key, idx) => {
        const serie = series[key];
        if (idx > 0) {
          axisOffsetX += serie.width;
        }
        return (
          <YAxis
            key={`axis--${key}`}
            zoomable={zoomable && !serie.staticDomain}
            series={serie}
            offsetx={axisOffsetX}
            height={height}
            strokeColor={serie.color}
            updateYScale={updateYScale}
          />
        );
      });
  }

  render() {
    const { offsetx = 0 } = this.props;
    return <g transform={`translate(${offsetx}, 0)`}>{this.renderAxes()}</g>;
  }
}

export default AxisCollection;
