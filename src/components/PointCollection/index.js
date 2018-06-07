import React from 'react';
import PropTypes from 'prop-types';
import ScalerContext from '../../context/Scaler';
import { createXScale, createYScale } from '../../utils/scale-helpers';
import Points from '../Points';

const propTypes = {};
const defaultProps = {};

class PointCollection extends React.Component {
  render() {
    const { width, height, series, domain } = this.props;

    const xScale = createXScale(domain, width);
    const points = series.filter(s => !s.hidden).map(s => {
      const yScale = createYScale(s.yDomain, height);
      return <Points key={s.id} {...s} xScale={xScale} yScale={yScale} />;
    });

    return (
      <g width={width} height={height}>
        <clipPath id="scatterplot-clip-path">
          <rect width={width} height={height} fill="none" />
        </clipPath>
        {points}
      </g>
    );
  }
}

export default PointCollection;

export const ScaledPointCollection = props => (
  <ScalerContext.Consumer>
    {({ subDomain, series }) => (
      <PointCollection {...props} series={series} domain={subDomain} />
    )}
  </ScalerContext.Consumer>
);
