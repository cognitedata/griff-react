import React from 'react';
import PropTypes from 'prop-types';
import CollapsedAxis from './CollapsedAxis';
import YAxis from './YAxis';
import ScalerContext from '../../context/Scaler';
import { seriesPropType, axisDisplayModeType } from '../../utils/proptypes';
import AxisDisplayMode from '../LineChart/AxisDisplayMode';

const propTypes = {
  height: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
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
  axisDisplayMode: axisDisplayModeType,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
};

const defaultProps = {
  series: [],
  zoomable: true,
  updateYTransformation: () => {},
  yAxisWidth: 50,
  axisDisplayMode: AxisDisplayMode.ALL,
  onMouseEnter: null,
  onMouseLeave: null,
};

class AxisCollection extends React.Component {
  axisFilter = mode => s =>
    !s.hidden && (s.yAxisDisplayMode || this.props.axisDisplayMode) === mode;

  renderAllAxes() {
    const {
      series,
      zoomable,
      height,
      updateYTransformation,
      yAxisWidth,
      yTransformations,
    } = this.props;
    let axisOffsetX = 0;
    return series.filter(this.axisFilter(AxisDisplayMode.ALL)).map((s, idx) => {
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
    });
  }

  renderPlaceholderAxis() {
    const { height, yAxisWidth, series } = this.props;
    const numCollapsed = series.filter(
      this.axisFilter(AxisDisplayMode.COLLAPSED)
    ).length;
    const numVisible = series.filter(this.axisFilter(AxisDisplayMode.ALL))
      .length;
    // TODO: Should we only do this if there's more than 1?
    if (numCollapsed) {
      return (
        <CollapsedAxis
          key="y-axis--collapsed"
          height={height}
          offsetx={numVisible * yAxisWidth}
          width={yAxisWidth}
        />
      );
    }
    return null;
  }

  render() {
    const { width, height, onMouseEnter, onMouseLeave } = this.props;

    // We need to render all of the axes (even if they're hidden) in order to
    // keep the zoom states in sync across show/hide toggles.
    const axes = this.renderAllAxes();
    return (
      <svg
        width={width}
        height={height}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onFocus={onMouseEnter}
        onBlur={onMouseLeave}
      >
        {axes}
        {this.renderPlaceholderAxis()}
      </svg>
    );
  }
}
AxisCollection.propTypes = propTypes;
AxisCollection.defaultProps = defaultProps;

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
