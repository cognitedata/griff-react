import React from 'react';
import PropTypes from 'prop-types';
import CollapsedAxis from './CollapsedAxis';
import YAxis from './YAxis';
import ScalerContext from '../../context/Scaler';
import {
  seriesPropType,
  axisDisplayModeType,
  axisPlacementType,
} from '../../utils/proptypes';
import AxisDisplayMode from '../LineChart/AxisDisplayMode';
import AxisPlacement from '../LineChart/AxisPlacement';

const propTypes = {
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
  axisDisplayMode: axisDisplayModeType,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  yAxisPlacement: axisPlacementType,
};

const defaultProps = {
  series: [],
  zoomable: true,
  updateYTransformation: () => {},
  yAxisWidth: 50,
  axisDisplayMode: AxisDisplayMode.ALL,
  yAxisPlacement: AxisPlacement.RIGHT,
  onMouseEnter: null,
  onMouseLeave: null,
};

class AxisCollection extends React.Component {
  onAxisMouseEnter = seriesId =>
    this.props.onMouseEnter ? e => this.props.onMouseEnter(e, seriesId) : null;

  onAxisMouseLeave = seriesId =>
    this.props.onMouseLeave ? e => this.props.onMouseLeave(e, seriesId) : null;

  axisFilter = mode => {
    const modes = mode.map ? mode : [mode];
    return s => {
      if (s.hidden) {
        return false;
      }
      return Boolean(
        modes.find(
          m => m.id === (s.yAxisDisplayMode || this.props.axisDisplayMode).id
        )
      );
    };
  };

  placementFilter = s =>
    !s.yAxisPlacement ||
    s.yAxisPlacement === AxisPlacement.BOTH ||
    s.yAxisPlacement === this.props.yAxisPlacement;

  renderAllVisibleAxes() {
    const {
      series,
      zoomable,
      height,
      updateYTransformation,
      yAxisPlacement,
      yAxisWidth,
      yTransformations,
    } = this.props;
    let axisOffsetX = 0;

    const filteredSeries = series
      .filter(this.axisFilter(AxisDisplayMode.ALL))
      .filter(this.placementFilter);
    if (yAxisPlacement === AxisPlacement.LEFT) {
      filteredSeries.reverse();
    }

    return filteredSeries.map((s, idx) => {
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
          onMouseEnter={this.onAxisMouseEnter(s.id)}
          onMouseLeave={this.onAxisMouseLeave(s.id)}
          yAxisPlacement={yAxisPlacement}
        />
      );
    });
  }

  renderPlaceholderAxis() {
    const { height, yAxisWidth, series, yAxisPlacement } = this.props;
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
          onMouseEnter={this.onAxisMouseEnter('collapsed')}
          onMouseLeave={this.onAxisMouseLeave('collapsed')}
          yAxisPlacement={yAxisPlacement}
        />
      );
    }
    return null;
  }

  render() {
    const { height, series, yAxisWidth } = this.props;

    const calculatedWidth =
      series
        .filter(
          this.axisFilter([AxisDisplayMode.ALL, AxisDisplayMode.COLLAPSED])
        )
        .filter(this.placementFilter).length * yAxisWidth;

    // We need to render all of the axes (even if they're hidden) in order to
    // keep the zoom states in sync across show/hide toggles.
    const axes = this.renderAllVisibleAxes();
    return (
      <svg width={calculatedWidth} height={height}>
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
