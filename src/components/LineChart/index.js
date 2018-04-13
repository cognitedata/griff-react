import React, { Component } from 'react';
import * as d3 from 'd3';
import Line from '../Line';
import Axis from '../Axis';
import Annotation from '../Annotation';

export default class LineChart extends Component {
  state = {
    linex: null,
    liney: null,
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

  calculateDomainFromData = (data, yAccessor) => {
    const extent = d3.extent(data, yAccessor);
    const diff = extent[1] - extent[0];
    return [extent[0] - diff * 0.025, extent[1] + diff * 0.025];
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
      onClickAnnotation,
      crosshairs,
      margin,
      hiddenSeries,
      annotations,
      config,
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
          scale={xScale}
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
              xScale={xScale}
              height={effectiveHeight}
              color={annotation.color}
            />
          ))}
        </g>
        {Object.keys(series)
          .filter(key => !hiddenSeries[key])
          .map((key, idx) => {
            const serie = series[key];
            const yAccessor = serie.yAccessor || yAxis.accessor;
            const yDomain = yAxis.calculateDomain
              ? yAxis.calculateDomain(serie.data)
              : this.calculateDomainFromData(serie.data, yAccessor);
            let scaler = rescaleY[key];
            if (!scaler) {
              scaler = { rescaleY: d => d };
            }
            const staticDomain = (yAxis.staticDomain || {})[key];
            let staticScale;
            if (staticDomain) {
              staticScale = d3
                .scaleLinear()
                .domain(staticDomain)
                .range([effectiveHeight, 0]);
            }
            const yScale = staticScale
              ? staticScale
              : scaler.rescaleY(
                  d3
                    .scaleLinear()
                    .domain(yDomain)
                    .range([effectiveHeight, 0])
                    .nice()
                );
            var items = [];
            if (showAxes) {
              items.push(
                <Axis
                  key={`axis--${key}`}
                  id={key}
                  scale={yScale}
                  zoomable={!staticScale}
                  mode="y"
                  offsetx={width + idx * yAxis.width}
                  width={yAxis.width}
                  offsety={effectiveHeight}
                  strokeColor={colors[key]}
                  updateYScale={this.props.updateYScale}
                />
              );
            }
            items.push(
              <Line
                key={`line--${key}`}
                data={serie.data}
                xScale={xScale}
                xAccessor={serie.xAccessor || xAxis.accessor}
                yAccessor={serie.yAccessor || yAxis.accessor}
                yScale={yScale}
                color={colors[key]}
                step={serie.step}
                drawPoints={serie.drawPoints}
              />
            );
            return items;
          })}
        <rect
          ref={ref => {
            this.zoomNode = ref;
          }}
          width={width}
          height={effectiveHeight}
          pointerEvents="all"
          fill="none"
          onClick={
            onClickAnnotation
              ? e => {
                  const xpos = e.nativeEvent.offsetX - margin.left;
                  const ypos = e.nativeEvent.offsetY - margin.top;
                  const rawTimestamp = xScale.invert(xpos).getTime();
                  annotations.forEach(a => {
                    if (rawTimestamp > a.data[0] && rawTimestamp < a.data[1]) {
                      // Clicked within an annotation
                      onClickAnnotation(a, xpos, ypos);
                    }
                  });
                }
              : null
          }
          onMouseMove={e => {
            if (Object.keys(series).length === 0) {
              return;
            }
            const xpos = e.nativeEvent.offsetX - margin.left;
            const ypos = e.nativeEvent.offsetY - margin.top;
            const rawTimestamp = xScale.invert(xpos).getTime();
            const serieKeys = Object.keys(series);
            const serie = series[serieKeys[0]];
            const output = { xpos, ypos, points: [] };
            serieKeys.forEach(key => {
              const { data } = series[key];
              const yAccessor = series[key].yAccessor || yAxis.accessor;
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
                let scaler = rescaleY[key];
                if (!scaler) {
                  scaler = { rescaleY: d => d };
                }
                const yDomain = yAxis.calculateDomain
                  ? yAxis.calculateDomain(data)
                  : d3.extent(data, yAccessor);
                const yScale = scaler.rescaleY(
                  d3
                    .scaleLinear()
                    .domain(yDomain)
                    .range([effectiveHeight, 0])
                );
                const ts = xAxis.accessor(d);
                const value = yAccessor(d);
                output.points.push({
                  timestamp: ts,
                  value,
                  x: xScale(ts),
                  y: yScale(value),
                });
                if (crosshairs) {
                  this.setState({ linex: xpos, liney: ypos });
                }
              } else {
                // points[key] = data[data.length - 1];
                if (crosshairs) {
                  this.setState({ linex: 0, liney: 0 });
                }
              }
            });
            onMouseMove && onMouseMove(output);
          }}
          onMouseOut={e => {
            onMouseMove && onMouseMove([]);
            if (crosshairs) {
              this.setState({ linex: null, liney: null });
            }
          }}
        />
      </g>
    );
  }
}
