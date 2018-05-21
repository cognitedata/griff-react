import React, { Component } from 'react';
import * as d3 from 'd3';
import Line from '../Line';
import Axis from '../Axis';
import Annotation from '../Annotation';
import Ruler from '../Ruler';
import PropTypes from 'prop-types';

export default class LineChart extends Component {
  static propTypes = {
    strokeWidths: PropTypes.objectOf(PropTypes.number),
  };

  static defaultProps = {
    strokeWidths: {},
  };

  state = {
    linex: null,
    liney: null,
    points: [],
    rulerX: null,
    rulerY: null,
  };

  isZoomable() {
    return 'zoomable' in this.props.config ? this.props.config.zoomable : true;
  }

  componentDidMount() {
    this.selection = d3.select(this.zoomNode);
    this.syncZoomingState();
  }

  componentDidUpdate(prevProps) {
    const { x, k } = this.props.transformation;
    const { x: prevx, k: prevk } = prevProps.transformation;
    if (!(x === prevx && k === prevk)) {
      this.selection.call(this.props.zoom.transform, this.props.transformation);
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
    this.processMouseMove(this.state.rulerX, this.state.rulerY, this.props);
    const t = d3.event.transform;
    const scale = this.props.xScale;
    const newScale = t.rescaleX(scale);
    const dd = newScale.domain().map(p => p.getTime());
    return this.props.subDomainChanged(dd);
  };

  processMouseMove = (xpos, ypos, props) => {
    const effectiveHeight = props.height * props.heightPct;
    const rawTimestamp = props.subXScale.invert(xpos).getTime();
    const serieKeys = Object.keys(props.series);
    const newPoints = [];
    serieKeys.forEach(key => {
      const { data } = props.series[key];
      const yAccessor = props.series[key].yAccessor || props.yAxis.accessor;
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
        let scaler = props.rescaleY[key];
        if (!scaler) {
          scaler = { rescaleY: d => d };
        }
        const yDomain = props.yAxis.calculateDomain
          ? props.yAxis.calculateDomain(data)
          : this.props.calculateDomainFromData(data, yAccessor);
        const yScale = scaler.rescaleY(
          d3
            .scaleLinear()
            .domain(yDomain)
            .range([effectiveHeight, 0])
            .nice()
        );
        const ts = props.xAxis.accessor(d);
        const value = yAccessor(d);
        newPoints.push({
          key,
          timestamp: ts,
          value,
          x: props.subXScale(ts),
          y: yScale(value),
        });
      } else {
        newPoints.push({ key });
      }
    });
    if (props.ruler) {
      this.setState({ points: newPoints });
    }
    if (props.crosshairs) {
      this.setState({ linex: xpos, liney: ypos });
    }
    props.onMouseMove && props.onMouseMove({ points: newPoints, xpos, ypos });
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
      ruler,
      margin,
      hiddenSeries,
      annotations,
      config,
      strokeWidths,
      calculateDomainFromData,
    } = this.props;
    const effectiveHeight = height * heightPct;
    const { linex, liney, points } = this.state;
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
              stroke="#ccc"
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
              : calculateDomainFromData(serie.data, yAccessor);
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
            const yScale =
              staticScale ||
              scaler.rescaleY(
                d3
                  .scaleLinear()
                  .domain(yDomain)
                  .range([effectiveHeight, 0])
                  .nice()
              );
            const items = [];
            if (showAxes) {
              items.push(
                <Axis
                  key={`axis--${key}`}
                  id={key}
                  scale={yScale}
                  zoomable={this.isZoomable() && !staticScale}
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
                strokeWidth={strokeWidths[key]}
              />
            );
            return items;
          })}

        {ruler && (
          <Ruler
            ruler={ruler}
            points={points}
            colors={colors}
            effectiveHeight={effectiveHeight}
            contextWidth={width}
          />
        )}

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
              : e => (this.props.onClick ? this.props.onClick(e) : null)
          }
          onMouseMove={e => {
            if (Object.keys(series).length === 0) {
              return;
            }
            const xpos = e.nativeEvent.offsetX - margin.left;
            const ypos = e.nativeEvent.offsetY - margin.top;
            this.processMouseMove(xpos, ypos, this.props);

            this.setState({
              rulerX: xpos,
              rulerY: ypos,
            });
          }}
          onMouseOut={e => {
            onMouseMove && onMouseMove([]);
            if (crosshairs) {
              this.setState({ linex: null, liney: null });
            }
            this.setState({
              rulerX: null,
              rulerY: null,
            });
            if (this.props.ruler) {
              this.setState({ points: [] });
            }
            this.props.onMouseOut && this.props.onMouseOut(e);
          }}
        />
      </g>
    );
  }
}
