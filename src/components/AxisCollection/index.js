import React from 'react';
import PropTypes from 'prop-types';
import CollapsedAxis from './CollapsedAxis';
import YAxis from './YAxis';
import ScalerContext from '../../context/Scaler';
import GriffPropTypes, {
  seriesPropType,
  axisDisplayModeType,
  axisPlacementType,
} from '../../utils/proptypes';
import AxisDisplayMode from '../LineChart/AxisDisplayMode';
import AxisPlacement from '../LineChart/AxisPlacement';

const propTypes = {
  height: PropTypes.number.isRequired,
  series: seriesPropType,
  collections: GriffPropTypes.collections,
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
  collections: [],
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

  getAxisOffsets = () => {
    const { series, yAxisPlacement, yAxisWidth } = this.props;

    const numCollapsed = series.filter(
      this.axisFilter(AxisDisplayMode.COLLAPSED)
    ).length;
    const numVisible = series.filter(this.axisFilter(AxisDisplayMode.ALL))
      .length;

    switch (yAxisPlacement) {
      case AxisPlacement.LEFT:
        return {
          collapsed: 0,
          visible: numCollapsed ? yAxisWidth : 0,
        };
      case AxisPlacement.BOTH:
        throw new Error(
          'BOTH is not a valid option for AxisCollection -- please specify RIGHT or LEFT'
        );
      case AxisPlacement.RIGHT:
      case AxisPlacement.UNSPECIFIED:
      default:
        return {
          collapsed: numVisible * yAxisWidth,
          visible: 0,
        };
    }
  };

  axisFilter = mode => s =>
    !s.hidden && (s.yAxisDisplayMode || this.props.axisDisplayMode) === mode;

  placementFilter = s =>
    !s.yAxisPlacement ||
    s.yAxisPlacement === AxisPlacement.BOTH ||
    s.yAxisPlacement === this.props.yAxisPlacement;

  renderAllVisibleAxes = offsetx => {
    const {
      collections,
      series,
      zoomable,
      height,
      updateYTransformation,
      yAxisPlacement,
      yAxisWidth,
      yTransformations,
    } = this.props;
    let axisOffsetX = offsetx - yAxisWidth;

    const filteredSeries = series
      .filter(this.axisFilter(AxisDisplayMode.ALL))
      .filter(this.placementFilter);
    if (yAxisPlacement === AxisPlacement.LEFT) {
      filteredSeries.reverse();
    }

    const filteredCollections = collections
      .filter(this.axisFilter(AxisDisplayMode.ALL))
      .filter(this.placementFilter);
    if (yAxisPlacement === AxisPlacement.LEFT) {
      filteredCollections.reverse();
    }

    return []
      .concat(
        filteredSeries.filter(s => s.collectionId === undefined).map(s => {
          axisOffsetX += yAxisWidth;
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
        })
      )
      .concat(
        filteredCollections.map(c => {
          axisOffsetX += yAxisWidth;

          const collectedSeries = series.filter(s => s.collectionId === c.id);

          const updateCollectionYTransformation = (
            collectionId,
            transformation
          ) => {
            collectedSeries.forEach(s => {
              updateYTransformation(s.id, transformation, height);
            });
            updateYTransformation(collectionId, transformation, height);
          };

          return (
            <YAxis
              key={`y-axis-collection-${c.id}`}
              offsetx={axisOffsetX}
              zoomable={c.zoomable !== undefined ? c.zoomable : zoomable}
              collection={c}
              height={height}
              width={yAxisWidth}
              updateYTransformation={updateCollectionYTransformation}
              yTransformation={yTransformations[c.id]}
              onMouseEnter={this.onAxisMouseEnter(c.id)}
              onMouseLeave={this.onAxisMouseLeave(c.id)}
            />
          );
        })
      );
  };

  renderPlaceholderAxis = offsetx => {
    const { height, yAxisWidth, series, yAxisPlacement } = this.props;
    const numCollapsed = series.filter(
      this.axisFilter(AxisDisplayMode.COLLAPSED)
    ).length;
    // TODO: Should we only do this if there's more than 1?
    if (numCollapsed) {
      return (
        <CollapsedAxis
          key="y-axis--collapsed"
          height={height}
          offsetx={offsetx}
          width={yAxisWidth}
          onMouseEnter={this.onAxisMouseEnter('collapsed')}
          onMouseLeave={this.onAxisMouseLeave('collapsed')}
          yAxisPlacement={yAxisPlacement}
        />
      );
    }
    return null;
  };

  render() {
    const { height, series, yAxisWidth } = this.props;

    const calculatedWidth = series
      .filter(this.axisFilter(AxisDisplayMode.ALL))
      .filter(this.placementFilter)
      .reduce((acc, s) => {
        if (s.yAxisDisplayMode === AxisDisplayMode.COLLAPSED) {
          return acc;
        }
        return acc + yAxisWidth;
      }, series.filter(this.axisFilter(AxisDisplayMode.COLLAPSED)).length ? yAxisWidth : 0);

    const {
      collapsed: collapsedOffsetX,
      visible: visibleOffsetX,
    } = this.getAxisOffsets();

    // We need to render all of the axes (even if they're hidden) in order to
    // keep the zoom states in sync across show/hide toggles.
    const axes = this.renderAllVisibleAxes(visibleOffsetX);
    return (
      <svg width={calculatedWidth} height={height}>
        {axes}
        {this.renderPlaceholderAxis(collapsedOffsetX)}
      </svg>
    );
  }
}
AxisCollection.propTypes = propTypes;
AxisCollection.defaultProps = defaultProps;

export default props => (
  <ScalerContext.Consumer>
    {({
      collections,
      series,
      yAxisWidth,
      updateYTransformation,
      yTransformations,
    }) => (
      <AxisCollection
        {...props}
        collections={collections}
        series={series}
        yAxisWidth={yAxisWidth}
        updateYTransformation={updateYTransformation}
        yTransformations={yTransformations}
      />
    )}
  </ScalerContext.Consumer>
);
