import React from 'react';
import PropTypes from 'prop-types';
import ScalerContext from '../../context/Scaler';
import CombinedYAxis from './CombinedYAxis';
import { seriesPropType } from '../../utils/proptypes';

const propTypes = {
  series: PropTypes.arrayOf(seriesPropType).isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  updateYTransformation: PropTypes.func.isRequired,
  yTransformations: PropTypes.objectOf(
    PropTypes.shape({
      k: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
      rescaleY: PropTypes.func.isRequired,
    })
  ),
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  zoomable: PropTypes.bool,
};
const defaultProps = {
  onMouseEnter: null,
  onMouseLeave: null,
  zoomable: true,
  yTransformations: [],
};

class UnifiedAxis extends React.Component {
  state = {};

  render() {
    const {
      series,
      width,
      height,
      onMouseEnter,
      onMouseLeave,
      zoomable,
      updateYTransformation,
      yTransformations,
    } = this.props;
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
          zoomable={zoomable}
          updateYTransformation={updateYTransformation}
          yTransformations={yTransformations}
        />
      </svg>
    );
  }
}

UnifiedAxis.propTypes = propTypes;
UnifiedAxis.defaultProps = defaultProps;

export default props => (
  <ScalerContext.Consumer>
    {({ series, yAxisWidth, updateYTransformation, yTransformations }) => (
      <UnifiedAxis
        {...props}
        series={series}
        yAxisWidth={yAxisWidth}
        updateYTransformation={updateYTransformation}
        yTransformations={yTransformations}
      />
    )}
  </ScalerContext.Consumer>
);
