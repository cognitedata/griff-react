import React from 'react';
import PropTypes from 'prop-types';
import ScalerContext from '../../context/Scaler';
import { createYScale } from '../../utils/scale-helpers';
import Points from '../Points';

const propTypes = {
  // (domain, width) => [number, number]
  xScalerFactory: PropTypes.func.isRequired,
};
const defaultProps = {};

class PointCollection extends React.Component {
  render() {
    const { width, height, series, domain, xScalerFactory } = this.props;

    const xScale = xScalerFactory(domain, width);
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
    {({ subDomain, series, xScalerFactory }) => (
      <PointCollection
        {...props}
        series={series}
        domain={subDomain}
        xScalerFactory={xScalerFactory}
      />
    )}
  </ScalerContext.Consumer>
);
