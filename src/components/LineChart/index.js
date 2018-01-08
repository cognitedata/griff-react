import React, { Component } from 'react';
import * as d3 from 'd3';
import Line from '../Line';
import Axis from '../Axis';

export default class LineChart extends Component {
  state = {
    linex: null,
    liney: null
  };

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
      rescaleY,
      colors,
      onMouseMove,
      crosshairs
    } = this.props;
    const effectiveHeight = height * heightPct;
    const { linex, liney } = this.state;
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
            />
          ]}
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
              strokeColor={colors[key]}
              updateYScale={this.props.updateYScale}
            />,
            <Line
              key={`line--${key}`}
              data={serie.data}
              xScale={xScale}
              xAccessor={serie.xAccessor || xAxis.accessor}
              yAccessor={serie.yAccessor || yAxis.accessor}
              yScale={yScale}
              color={colors[key]}
              step={serie.step}
            />
          ];
        })}
        <rect
          ref={ref => {
            this.zoomNode = ref;
          }}
          width={width}
          height={effectiveHeight}
          pointerEvents="all"
          fill="none"
          onMouseMove={e => {
            if (Object.keys(series).length === 0) {
              return;
            }
            const xpos = e.nativeEvent.offsetX;
            const ypos = e.nativeEvent.offsetY;
            const rawTimestamp = xScale.invert(xpos).getTime();
            const serieKeys = Object.keys(series);
            const serie = series[serieKeys[0]];
            const points = {};
            serieKeys.forEach(key => {
              const { data } = series[key];
              const rawX = d3
                .bisector(d => d.timestamp)
                .left(data, rawTimestamp, 1);
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
                d =
                  rawTimestamp - x0.timestamp > x1.timestamp - rawTimestamp
                    ? x1
                    : x0;
              }
              if (d) {
                points[key] = yAxis.accessor(d);
                if (crosshairs) {
                  this.setState({ linex: xpos, liney: ypos });
                }
              } else {
                points[key] = data[data.length - 1];
                if (crosshairs) {
                  this.setState({ linex: 0, liney: 0 });
                }
              }
            });
            onMouseMove(points);
          }}
          onMouseOut={e => {
            if (crosshairs) {
              this.setState({ linex: null, liney: null });
            }
          }}
        />
      </g>
    );
  }
}
