import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Promise from 'bluebird';
import * as d3 from 'd3';
import DataContext from '../../context/Data';
import { seriesPropType } from '../../utils/proptypes';

const calculateDomainFromData = (data, accessor) => {
  const extent = d3.extent(data, accessor);
  const diff = extent[1] - extent[0];
  if (Math.abs(diff) < 1e-3) {
    return [1 / 2 * extent[0], 3 / 2 * extent[0]];
  }
  return [extent[0] - diff * 0.025, extent[1] + diff * 0.025];
};

const deleteUndefinedFromObject = obj => {
  if (!obj) {
    return {};
  }
  const newObject = {};
  Object.keys(obj).forEach(k => {
    if (obj[k] !== undefined) {
      newObject[k] = obj[k];
    }
  });
  return newObject;
};

export default class DataProvider extends Component {
  state = {
    domain: this.props.baseDomain,
    subDomain: this.props.baseDomain,
    contextSeries: {},
    enhancedSeries: [],
  };

  async componentDidMount() {
    await this.fetchData('MOUNTED');
    if (this.props.updateInterval) {
      this.fetchInterval = setInterval(() => {
        this.fetchData('INTERVAL');
      }, this.props.updateInterval);
    }
  }

  componentDidUpdate(prevProps) {
    const { series: newSeries, baseDomain: newDomain } = this.props;
    const { series: oldSeries, baseDomain: oldDomain } = prevProps;

    for (let i = 0; i < newSeries.length; i += 1) {
      if (!oldSeries.find(s => s.id === newSeries[i].id)) {
        return this.fetchData('SERIES_UPDATED');
      }
    }

    for (let j = 0; j < oldSeries.length; j += 1) {
      if (!newSeries.find(s => s.id === oldSeries[j].id)) {
        return this.fetchData('SERIES_UPDATED');
      }
    }

    if (
      newDomain &&
      oldDomain &&
      (newDomain[0] !== oldDomain[0] || newDomain[1] !== oldDomain[1])
    ) {
      return this.fetchData('NEW_DOMAIN');
    }
    return 1;
  }

  componentWillUnmount() {
    clearInterval(this.fetchInterval);
    this.unmounted = true;
  }

  getSeriesObjects() {
    const { series, yAccessor, xAccessor } = this.props;
    const { enhancedSeries } = this.state;

    return series.map(s => ({
      data: [],
      ...deleteUndefinedFromObject(s),
      ...deleteUndefinedFromObject(
        enhancedSeries.find(enhancedSerie => enhancedSerie.id === s.id)
      ),
      yAccessor: s.yAccessor || yAccessor,
      xAccessor: s.xAccessor || xAccessor,
    }));
  }

  fetchData = async reason => {
    const { pointsPerSeries, defaultLoader } = this.props;
    const { domain, subDomain } = this.state;
    const newLoaderConfig = {};
    const seriesObjects = this.getSeriesObjects();
    const enhancedSeries = await Promise.map(seriesObjects, async s => {
      const loader = s.loader || defaultLoader;
      if (!loader) {
        throw new Error(`Series ${s.id} does not have a loader.`);
      }
      const loaderReturn = await loader({
        id: s.id,
        domain,
        subDomain,
        pointsPerSeries,
        oldSerie: s,
        reason,
      });
      const data =
        Array.isArray(loaderReturn.data) && loaderReturn.data.length
          ? loaderReturn.data
          : [];
      return {
        ...s,
        ...loaderReturn,
        data,
        id: s.id,
        reason,
        yDomain:
          s.yDomain || data.length
            ? calculateDomainFromData(data, s.yAccessor)
            : [0, 0],
      };
    });
    const stateUpdates = {};
    stateUpdates.enhancedSeries = enhancedSeries;
    enhancedSeries.forEach(s => {
      newLoaderConfig[s.id] = {
        ...s,
      };
    });
    if (reason !== 'UPDATE_SUBDOMAIN') {
      stateUpdates.contextSeries = { ...newLoaderConfig };
    }
    if (reason === 'INTERVAL') {
      // // shift serie data array if a new item has been added to the end
      let shiftCounter = 0;
      enhancedSeries.forEach(serie => {
        const oldSerie = this.state.enhancedSeries.find(s => s.id === serie.id);
        if (oldSerie) {
          const newSerieLength = serie.data.length;
          const oldSerieLength = oldSerie.data.length;
          if (newSerieLength > oldSerieLength) {
            for (let i = oldSerieLength; i < newSerieLength; i += 1) {
              shiftCounter += 1;
              serie.data.shift();
            }
          }
        }
      });

      let domainMax = this.state.domain[1];
      let domainMin = this.state.domain[0];
      enhancedSeries.forEach(serie => {
        const { data, xAccessor } = serie;
        const serieXMax = xAccessor(data[data.length - 1]);
        const serieXMin = xAccessor(data[0]);
        domainMax = Math.max(domainMax, serieXMax);
        domainMin = Math.max(domainMin, serieXMin);
      });

      stateUpdates.domain = [domainMin, domainMax];

      // follow most right or left subdomains
      if (
        this.state.subDomain[1] === this.state.domain[1] ||
        this.state.subDomain[0] === this.state.domain[0]
      ) {
        let max = Number.MIN_SAFE_INTEGER;
        let min = Number.MAX_SAFE_INTEGER;
        enhancedSeries.forEach(serie => {
          const { xAccessor } = serie;
          const data = serie.data.filter(d => {
            const value = xAccessor(d);
            return (
              this.state.subDomain[0] < value &&
              value <= this.state.subDomain[1]
            );
          });
          if (data.length) {
            const lastValue = serie.data.findIndex(
              d => xAccessor(d) === xAccessor(data[data.length - 1])
            );
            min = Math.min(min, xAccessor(data[0]));
            max = Math.max(
              max,
              xAccessor(serie.data[lastValue + shiftCounter])
            );
          }
        });
        stateUpdates.subDomain =
          min === Number.MAX_SAFE_INTEGER || max === Number.MIN_SAFE_INTEGER
            ? subDomain
            : [min, max];
      } else {
        stateUpdates.subDomain = this.state.subDomain;
      }
    }
    this.setState(stateUpdates);
  };

  subDomainChanged = subDomain => {
    const current = this.state.subDomain;
    if (subDomain[0] === current[0] && subDomain[1] === current[1]) {
      return;
    }
    clearTimeout(this.subDomainChangedTimeout);
    this.subDomainChangedTimeout = setTimeout(
      () => this.fetchData('UPDATE_SUBDOMAIN'),
      250
    );
    this.setState({ subDomain });
  };

  render() {
    const { contextSeries, domain, subDomain, enhancedSeries } = this.state;
    const { yAxisWidth, children } = this.props;
    if (enhancedSeries.length === 0) {
      // Do not bother, loader hasn't given any data yet.
      return null;
    }
    const context = {
      series: enhancedSeries,
      baseDomain: domain,
      subDomain,
      yAxisWidth,
      subDomainChanged: this.subDomainChanged,
      contextSeries: enhancedSeries.map(s => ({
        ...contextSeries[s.id],
        ...s,
        drawPoints: false,
        data: (contextSeries[s.id] || { data: [] }).data,
      })),
    };

    return (
      <DataContext.Provider value={context}>{children}</DataContext.Provider>
    );
  }
}

DataProvider.propTypes = {
  baseDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
  updateInterval: PropTypes.number,
  yAccessor: PropTypes.func,
  xAccessor: PropTypes.func,
  yAxisWidth: PropTypes.number,
  pointsPerSeries: PropTypes.number,
  children: PropTypes.node.isRequired,
  defaultLoader: PropTypes.func,
  series: seriesPropType.isRequired,
};

DataProvider.defaultProps = {
  updateInterval: 0,
  xAccessor: d => d.timestamp,
  yAccessor: d => d.value,
  pointsPerSeries: 250,
  yAxisWidth: 50,
  defaultLoader: null,
  shift: true,
};
