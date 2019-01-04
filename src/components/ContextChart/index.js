import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { SizeMe } from 'react-sizeme';
import ScalerContext from '../../context/Scaler';
import LineCollection from '../LineCollection';
import XAxis from '../XAxis';
import Annotation from '../Annotation';
import GriffPropTypes, { annotationPropType } from '../../utils/proptypes';
import Brush from '../Brush';
import AxisPlacement from '../AxisPlacement';
import multiFormat from '../../utils/multiFormat';
import Axes from '../../utils/Axes';
import { createYScale, createXScale } from '../../utils/scale-helpers';
import { stripPlaceholderDomain } from '../Scaler';
import { calculateDomainFromData } from '../DataProvider';

class ContextChart extends Component {
  static propTypes = {
    height: PropTypes.number,
    annotations: PropTypes.arrayOf(annotationPropType),
    zoomable: PropTypes.bool,
    // Number => String
    xAxisFormatter: PropTypes.func,
    xAxisHeight: PropTypes.number,
    xAxisPlacement: GriffPropTypes.axisPlacement,

    // These are all provided by Griff.
    domainsByItemId: GriffPropTypes.domainsByItemId.isRequired,
    series: GriffPropTypes.multipleSeries.isRequired,
    subDomainsByItemId: GriffPropTypes.subDomainsByItemId.isRequired,
    timeDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    timeSubDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
    updateDomains: GriffPropTypes.updateDomains.isRequired,
    width: PropTypes.number,
  };

  static defaultProps = {
    width: 1,
    height: 150,
    annotations: [],
    zoomable: true,
    xAxisFormatter: multiFormat,
    xAxisHeight: 50,
    xAxisPlacement: AxisPlacement.BOTTOM,
  };

  onUpdateSelection = selection => {
    const { series, timeDomain, width } = this.props;
    const xScale = createXScale(timeDomain, width);
    const timeSubDomain = selection.map(xScale.invert).map(Number);
    this.props.updateDomains(
      series.reduce(
        (changes, s) => ({
          ...changes,
          [s.id]: {
            time: timeSubDomain,
          },
        }),
        {}
      )
    );
  };

  getChartHeight = () => {
    const { height, xAxisHeight, xAxisPlacement } = this.props;

    return (
      height -
      xAxisHeight -
      (xAxisPlacement === AxisPlacement.BOTH ? xAxisHeight : 0)
    );
  };

  getYScale = (s, height) => {
    const { domainsByItemId } = this.props;
    const domain =
      stripPlaceholderDomain(s.yDomain) ||
      stripPlaceholderDomain(Axes.y(domainsByItemId[s.collectionId || s.id])) ||
      calculateDomainFromData(s.data, s.yAccessor, s.y0Accessor, s.y1Accessor);
    return createYScale(domain, height);
  };

  renderXAxis = (position, xAxis) => {
    const { xAxisPlacement } = this.props;
    if (position === xAxisPlacement) {
      return xAxis;
    }
    if (xAxisPlacement === AxisPlacement.BOTH) {
      return React.cloneElement(xAxis, { xAxisPlacement: position });
    }
    return null;
  };

  render() {
    const {
      domainsByItemId,
      series,
      subDomainsByItemId,
      width,
      xAxisFormatter,
      xAxisHeight,
      xAxisPlacement,
      zoomable,
    } = this.props;

    const firstItemId = series[0].id;
    const timeDomain = Axes.time(domainsByItemId[firstItemId]);
    const timeSubDomain = Axes.time(subDomainsByItemId[firstItemId]);
    const height = this.getChartHeight();
    const xScale = createXScale(timeDomain, width);
    const selection = timeSubDomain.map(xScale);
    const annotations = this.props.annotations.map(a => (
      <Annotation key={a.id} {...a} height={height} xScale={xScale} />
    ));

    const xAxis = (
      <XAxis
        height={xAxisHeight}
        domain={timeDomain}
        tickFormatter={xAxisFormatter}
        placement={xAxisPlacement}
        scaled={false}
        axis={Axes.time}
      />
    );

    return (
      <React.Fragment>
        {this.renderXAxis(AxisPlacement.TOP, xAxis)}
        <svg
          height={height}
          width={width}
          style={{ width: '100%', display: 'block' }}
        >
          {annotations}
          <LineCollection
            series={series.map(s => ({ ...s, drawPoints: false }))}
            width={width}
            height={height}
            yScalerFactory={this.getYScale}
            scaleY={false}
            scaleX={false}
            subDomainsByItemId={subDomainsByItemId}
          />
          <Brush
            width={width}
            height={height}
            selection={selection}
            onUpdateSelection={this.onUpdateSelection}
            zoomable={zoomable}
          />
        </svg>
        {this.renderXAxis(AxisPlacement.BOTTOM, xAxis)}
      </React.Fragment>
    );
  }
}

export default props => (
  <ScalerContext.Consumer>
    {({
      domainsByItemId,
      subDomainsByItemId,
      timeSubDomain,
      timeDomain,
      updateDomains,
      series,
    }) => (
      <SizeMe monitorWidth>
        {({ size }) => (
          <ContextChart
            width={size.width}
            series={series}
            {...props}
            timeDomain={timeDomain}
            timeSubDomain={timeSubDomain}
            subDomainsByItemId={subDomainsByItemId}
            domainsByItemId={domainsByItemId}
            updateDomains={updateDomains}
          />
        )}
      </SizeMe>
    )}
  </ScalerContext.Consumer>
);
