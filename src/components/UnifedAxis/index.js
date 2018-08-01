import React from 'react';
import PropTypes from 'prop-types';
import ScalerContext from '../../context/Scaler';
import CombinedYAxis from './CombinedYAxis';
import { seriesPropType } from '../../utils/proptypes';

const propTypes = {
  series: seriesPropType.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
};
const defaultProps = {
  onMouseEnter: null,
  onMouseLeave: null,
};

class UnifiedAxis extends React.Component {
  state = {};

  render() {
    const { series, width, height, onMouseEnter, onMouseLeave } = this.props;
    return (
      <svg
        width={width}
        height={height}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocus={onMouseEnter}
        onBlur={onMouseLeave}
      >
        <CombinedYAxis
          series={series.filter(s => !s.hidden)}
          width={width}
          height={height}
        />
      </svg>
    );
  }
}

UnifiedAxis.propTypes = propTypes;
UnifiedAxis.defaultProps = defaultProps;

export default props => (
  <ScalerContext.Consumer>
    {({ series, yAxisWidth }) => (
      <UnifiedAxis {...props} series={series} yAxisWidth={yAxisWidth} />
    )}
  </ScalerContext.Consumer>
);
