import React from 'react';
import PropTypes from 'prop-types';
import YAxis from './YAxis';
import ScalerContext from '../../context/Scaler';
import { seriesPropType } from '../../utils/proptypes';

class AxisCollection extends React.Component {
  static propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    series: seriesPropType,
    zoomable: PropTypes.bool,
    updateYTransformation: PropTypes.func,
    yAxisWidth: PropTypes.number,
    yTransformations: PropTypes.objectOf(
      PropTypes.shape({
        k: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
        rescaleY: PropTypes.func.isRequired,
      })
    ).isRequired,
  };

  static defaultProps = {
    series: [],
    zoomable: true,
    updateYTransformation: () => {},
    yAxisWidth: 50,
  };

  shouldComponentUpdate() {
    // TODO: Implement
    return true;
  }

  render() {
    const {
      width,
      height,
      series,
      zoomable,
      yAxisWidth,
      updateYTransformation,
      yTransformations,
    } = this.props;
    let axisOffsetX = 0;
    return (
      <svg width={width} height={height}>
        {series.filter(s => !s.hidden).map((s, idx) => {
          if (idx > 0) {
            axisOffsetX += yAxisWidth;
          }
          return (
            <YAxis
              key={`y-axis--${s.id}`}
              offsetx={axisOffsetX}
              zoomable={s.zoomable !== undefined ? s.zoomable : zoomable}
              series={s}
              height={height}
              width={yAxisWidth}
              updateYTransformation={updateYTransformation}
              yTransformation={yTransformations[s.id]}
            />
          );
        })}
      </svg>
    );
  }
}

export default props => (
  <ScalerContext.Consumer>
    {({ series, yAxisWidth, updateYTransformation, yTransformations }) => (
      <AxisCollection
        {...props}
        series={series}
        yAxisWidth={yAxisWidth}
        updateYTransformation={updateYTransformation}
        yTransformations={yTransformations}
      />
    )}
  </ScalerContext.Consumer>
);
