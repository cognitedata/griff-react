import React from 'react';
import PropTypes from 'prop-types';
import Scaler from '../Scaler';
import ScalerContext from '../../context/Scaler';
import { ScaledPointCollection } from '../PointCollection';

const propTypes = {};

const defaultProps = {};

class ScatterplotComponent extends React.Component {
  render() {
    const { width, height } = this.props;
    return (
      <svg width={width} height={height}>
        <ScaledPointCollection height={height} width={width} />
      </svg>
    );
  }
}

const Scatterplot = props => (
  <Scaler>
    <ScalerContext.Consumer>
      {({ series, subDomain }) => (
        <ScatterplotComponent
          {...props}
          series={series}
          subDomain={subDomain}
        />
      )}
    </ScalerContext.Consumer>
  </Scaler>
);

export default Scatterplot;
