import * as d3 from 'd3';

/**
 * Represents a data series.
 */
export default class Series {
  static defaultScaler = { rescaleY: d => d };

  constructor(obj) {
    Object.keys(obj).forEach(key => {
      this[key] = obj[key];
    });
  }

  calculateDomainFromData = () => {
    const extent = d3.extent(this.data, this.yAccessor);
    const diff = extent[1] - extent[0];
    if (Math.abs(diff) < 1e-3) {
      return [1 / 2 * extent[0], 3 / 2 * extent[0]];
    }
    return [extent[0] - diff * 0.025, extent[1] + diff * 0.025];
  };

  scale = range => {
    if (this.staticDomain) {
      return this.staticScale(range);
    }
    const scaler = this.scaler || Series.defaultScaler;
    return scaler.rescaleY(
      d3
        .scaleLinear()
        .domain(this.baseYDomain)
        .range(range)
        .nice()
    );
  };

  staticScale = range => {
    return d3
      .scaleLinear()
      .domain(this.staticDomain)
      .range(range)
      .nice();
  };
}
