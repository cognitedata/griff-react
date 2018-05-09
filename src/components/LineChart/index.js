import React, { Component } from 'react';
import * as d3 from 'd3';
import Line from '../Line';
import Axis from '../Axis';
import AxisCollection from '../AxisCollection';
import Annotation from '../Annotation';
import PropTypes from 'prop-types';

export default class LineChart extends Component {
  static propTypes = {
    annotations: PropTypes.array,
    config: PropTypes.object,
    crosshairs: PropTypes.bool,
    height: PropTypes.number,
    heightPct: PropTypes.number.isRequired,
    margin: PropTypes.objectOf(PropTypes.number),
    offsetY: PropTypes.number,
    onClickAnnotation: PropTypes.func,
    onMouseMove: PropTypes.func,
    onMouseOut: PropTypes.func,
    rescaleY: PropTypes.objectOf(PropTypes.object),
    series: PropTypes.object,
    subDomainScale: PropTypes.func,
    width: PropTypes.number,
    xAxis: PropTypes.object,
    xScale: PropTypes.func,
    yAxis: PropTypes.object,
    xTransformation: PropTypes.objectOf(PropTypes.number),
  };

  static defaultProps = {
    margin: {
      bottom: 0,
      left: 0,
      right: 0,
      top: 0,
    },
  };

  state = {
    linex: null,
    liney: null,
  };

  isZoomable() {
    return 'zoomable' in this.props.config ? this.props.config.zoomable : true;
  }

  componentDidMount() {
    this.selection = d3.select(this.zoomNode);
    this.syncZoomingState();
  }

  componentDidUpdate(prevProps) {
    const { x, k } = this.props.xTransformation;
    const { x: prevx, k: prevk } = prevProps.xTransformation;
    if (!(x === prevx && k === prevk)) {
      this.selection.call(
        this.props.zoom.transform,
        this.props.xTransformation
      );
    }

    if (prevProps.config.zoomable != this.props.config.zoomable) {
      this.syncZoomingState();
    }
  }

  syncZoomingState = () => {
    if (this.isZoomable()) {
      this.selection.call(this.props.zoom.on('zoom', this.zoomed));
    } else {
      this.selection.on('.zoom', null);
    }
  };

  zoomed = () => {
    const t = d3.event.transform;
    const scale = this.props.xScale;
    const newScale = t.rescaleX(scale);
    const dd = newScale.domain().map(p => p.getTime());
    return this.props.subDomainChanged(dd);
  };

  calculateDomainFromData = (data, yAccessor) => {
    const extent = d3.extent(data, yAccessor);
    const diff = extent[1] - extent[0];
    if (Math.abs(diff) < 1e-3) {
      return [1 / 2 * extent[0], 3 / 2 * extent[0]];
    }
    return [extent[0] - diff * 0.025, extent[1] + diff * 0.025];
  };

  onClick = e => {
    const {
      annotations,
      margin,
      onClick,
      onClickAnnotation,
      subDomainScale,
    } = this.props;
    if (onClickAnnotation) {
      const xpos = e.nativeEvent.offsetX - margin.left;
      const ypos = e.nativeEvent.offsetY - margin.top;
      const rawTimestamp = subDomainScale.invert(xpos).getTime();
      annotations.forEach(a => {
        if (rawTimestamp > a.data[0] && rawTimestamp < a.data[1]) {
          // Clicked within an annotation
          onClickAnnotation(a, xpos, ypos);
        }
      });
    } else if (onClick) {
      return onClick(e);
    }
  };

  onMouseMove = e => {
    const {
      crosshairs,
      effectiveHeight,
      margin,
      offsetX,
      onMouseMove,
      rescaleY,
      series,
      height,
      xAxis,
      subDomainScale,
      yAxis,
    } = this.props;
    if (Object.keys(series).length === 0) {
      return;
    }
    const xpos = e.nativeEvent.offsetX - margin.left;
    const ypos = e.nativeEvent.offsetY - margin.top;
    const rawTimestamp = subDomainScale.invert(xpos).getTime();
    const serieKeys = Object.keys(series);
    const serie = series[serieKeys[0]];
    const output = { xpos, ypos, points: [] };
    serieKeys.forEach(key => {
      const serie = series[key];
      const data = serie.data;
      const yAccessor = serie.yAccessor || yAxis.accessor;
      const rawX = d3.bisector(d => d.timestamp).left(data, rawTimestamp, 1);
      const x0 = data[rawX - 1];
      const x1 = data[rawX];
      let d = null;
      if (x0 && !x1) {
        d = x0;
      } else if (x1 && !x0) {
        d = x1;
      } else if (!x0 && !x1) {
        d = null;
      } else {
        d = rawTimestamp - x0.timestamp > x1.timestamp - rawTimestamp ? x1 : x0;
      }
      if (d) {
        const yScale = serie.scale([0, height]);
        const ts = xAxis.accessor(d);
        const value = yAccessor(d);
        output.points.push({
          key: key,
          timestamp: ts,
          value,
          x: subDomainScale(ts),
          y: yScale(value),
        });
      } else {
        output.points.push({ key: key });
      }
    });
    if (crosshairs) {
      this.setState({ linex: xpos, liney: ypos });
    }
    onMouseMove && onMouseMove(output);
  };

  onMouseOut = e => {
    const { onMouseMove, onMouseOut, crosshairs } = this.props;
    onMouseMove && onMouseMove([]);
    if (crosshairs) {
      this.setState({ linex: null, liney: null });
    }
    onMouseOut && onMouseOut(e);
  };

  render() {
    const {
      annotations,
      colors,
      config,
      crosshairs,
      height,
      heightPct,
      hiddenSeries,
      margin,
      offsetY,
      onClickAnnotation,
      onMouseMove,
      rescaleY,
      series,
      strokeWidths,
      subDomainScale,
      subDomain,
      width,
      xAxis,
      yAxis,
      xTransformation,
    } = this.props;
    const effectiveHeight = height * heightPct;
    const { linex, liney } = this.state;
    let yAxisDisplayMode = 'ALL';
    if (config.yAxis && config.yAxis.display) {
      yAxisDisplayMode = config.yAxis.display;
    }
    const showAxes = yAxisDisplayMode === 'ALL';
    return (
      <g className="line-chart" transform={`translate(0, ${offsetY})`}>
        {linex &&
          liney && [
            <line
              key={0}
              x1={0}
              x2={width}
              stroke={'#ccc'}
              strokeWidth={1}
              y1={liney}
              y2={liney}
            />,
            <line
              key={1}
              y1={0}
              y2={effectiveHeight}
              stroke="#ccc"
              strokeWidth="1"
              x1={linex}
              x2={linex}
            />,
          ]}
        <clipPath id="linechart-clip-path">
          <rect width={width} height={effectiveHeight} fill="none" />
        </clipPath>
        <Axis
          key="axis--x"
          scale={subDomainScale}
          mode="x"
          offsetx={0}
          offsety={effectiveHeight}
        />
        <g clipPath="url(#linechart-clip-path)">
          {annotations.map(annotation => (
            <Annotation
              key={annotation.id}
              id={annotation.id}
              data={annotation.data}
              xScale={subDomainScale}
              height={effectiveHeight}
              color={annotation.color}
            />
          ))}
        </g>
        {showAxes && (
          <AxisCollection
            heightPct={1}
            series={series}
            height={effectiveHeight}
            offsetx={width}
            updateYScale={this.props.updateYScale}
          />
        )}
        {Object.keys(series)
          .filter(key => !series[key].hidden)
          .map((key, idx) => {
            const serie = series[key];
            return (
              <Line
                key={`line--${key}`}
                data={serie.data}
                xScale={subDomainScale}
                xAccessor={serie.xAccessor}
                yAccessor={serie.yAccessor}
                yScale={serie.scale([effectiveHeight, 0])}
                color={serie.color}
                step={serie.step}
                drawPoints={serie.drawPoints}
                strokeWidth={serie.strokeWidth}
              />
            );
          })}
        <rect
          ref={ref => {
            this.zoomNode = ref;
          }}
          width={width}
          height={effectiveHeight}
          pointerEvents="all"
          fill="none"
          onClick={this.onClick}
          onMouseMove={this.onMouseMove}
          onMouseOut={this.onMouseOut}
        />
      </g>
    );
  }
}
