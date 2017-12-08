import React, { Component } from 'react';
import * as d3 from 'd3';
import Line from '../Line';
import Axis from '../Axis';

export default class LineChart extends Component {
  componentDidMount() {
    this.selection = d3.select(this.zoomNode);
    this.selection.call(this.props.zoom.on('zoom', this.zoomed));
  }

  componentDidUpdate(prevProps) {
    const { x, k } = this.props.transformation;
    const { x: prevx, k: prevk } = prevProps.transformation;
    if (!(x === prevx && k === prevk)) {
      this.selection.call(this.props.zoom.transform, this.props.transformation);
    }
  }

  zoomed = () => {
    const t = d3.event.transform;
    const scale = this.props.xScale;
    const newScale = t.rescaleX(scale);
    const dd = newScale.domain().map(p => p.getTime());
    return this.props.subDomainChanged(dd);
  };

  render() {
    const {
      yAxis,
      xAxis,
      series,
      height,
      width,
      heightPct,
      offsetY,
      subXScale: xScale,
      rescaleY
    } = this.props;
    const effectiveHeight = height * heightPct;
    return (
      <g className="line-chart" transform={`translate(0, ${offsetY})`}>
        <clipPath id="linechart-clip-path">
          <rect width={width} height={effectiveHeight} fill="none" />
        </clipPath>
        <Axis
          key="axis--x"
          scale={xScale}
          mode="x"
          offsetx={0}
          offsety={effectiveHeight}
        />
        {Object.keys(series).map((key, idx) => {
          const serie = series[key];
          const yDomain = yAxis.calculateDomain
            ? yAxis.calculateDomain(serie.data)
            : d3.extent(serie.data, serie.yAccessor || yAxis.accessor);
          let scaler = rescaleY[key];
          if (!scaler) {
            scaler = { rescaleY: d => d };
          }
          const yScale = scaler.rescaleY(
            d3
              .scaleLinear()
              .domain(yDomain)
              .range([effectiveHeight, 0])
          );
          return [
            <Axis
              key={`axis--${key}`}
              id={key}
              scale={yScale}
              mode="y"
              offsetx={width + idx * yAxis.width}
              width={yAxis.width}
              offsety={effectiveHeight}
              strokeColor={serie.color}
              updateYScale={this.props.updateYScale}
            />,
            <Line
              key={`line--${key}`}
              data={serie.data}
              xScale={xScale}
              xAccessor={serie.xAccessor || xAxis.accessor}
              yAccessor={serie.yAccessor || yAxis.accessor}
              yScale={yScale}
              color={serie.color}
            />
          ];
        })}
        <rect
          ref={ref => {
            this.zoomNode = ref;
          }}
          width={width}
          height={effectiveHeight}
          fill="none"
          pointerEvents="all"
        />
      </g>
    );
  }
}
