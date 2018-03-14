# griff-react

High-performance charting of time series with dynamic data in mind. Using the
power of React to render, with event-handling and maths by d3.

`griff-react` introduces the concept of dynamic data loading for
displaying complex time series. You provide a `loader` function which is in
charge of fetching the data given input parameters. For instance, if the current
domain is 1 year, you might want to fetch daily aggregates instead of the raw
process values.

### Storybook & demo: https://griff.surge.sh

## Test locally

```sh
git clone https://github.com/cognitedata/react-cognitechart
yarn
yarn start
```

Will run the local demo located at `demo/src/index.js`

## Usage

`yarn add @cognite/griff-react`

or

`npm i @cognite/griff-react`

See examples in `demo/src` and `stories/index.js`

## Concepts

### DataProvider

The outermost component in the hierarchy. The DataProvider is in charge of handling the data for all the other components. It passes on all its props to its children, creating an outer `<div>` with a set height and width.

The DataProvider takes a `config` property, here is an example of a config:

```js
{
  yAxis: {
    accessor: d => d.value,
    width: 50,
    staticDomain: {serieId: [ymin, ymax]},
    calculateDomain: d => d3.extent(d)
  },
  xAxis: {
    accessor: d => d.timestamp,
    calculateDomain: data => d3.extent(d => d.timestamp),
  },
  baseDomain: d3.extent(data, d => d.timestamp),
  pointsPerSerie: 500,
  hiddenSeries: {serieId: false},
  colors: { serieId: '#f3f3f3' }
}
```

Both the `yAxis` and `xAxis` property specifies an accessor. Assuming your data has the following structure:

```js
[
  {
    x: 1521027516564,
    y: 100,
  },
];
```

the accessor functions would be the following:

```js
xAccessor = d => d.x;
yAccessor = d => d.y;
```

What if you want to chart data with different structures? You can also specify a specific accessor function for each serie which you pass through the `loader` function which will be covered in the next section.

You can pass in an optional `calculateDomain` function to dynamically adjust the starting point for the yAxis. If this is not passed in it will automatically calculate a domain from the data points.

```js
DataProvider.propTypes = {
  config: PropTypes.object.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  margin: PropTypes.object,
  updateInterval: PropTypes.number,
  hiddenSeries: PropTypes.objectOf(PropTypes.bool),
};
```

### The data loader

The thing that separates this library with other libraries is the concept of the data loader. The data loader is a function that gets called by the `DataProvider` with information about the current state of the chart as well as the reason why it's called. The different reasons are

```js
MOUNTED, // First render of the chart
INTERVAL, // If you specify an update interval, it will be called every n seconds
NEW_LOADER, // The loader function changed
NEW_DOMAIN, // The outer domain changed,
NEW_SUBDOMAIN, // The user zoomed to a new subdomain.
```

The simplest loader simply delivers static data and would look like this:

```js
const randomData = () => {
  // generate random data
  return data;
};

const loader = () => {
  const series = {
    1: { data: randomData() },
    2: { data: randomData() },
  };
  return (domain, subDomain, config, oldSeries, reason) => {
    return series;
  };
};
```

The loader should return an object with the following structure:

```js
{
  serieId: {
    data: Array, // required
    step: Boolean, // optional. If this is a step serie, the charts will display it as such
    drawPoints: Boolean, // Draw the points or just the line? Drawing points on big series is a big performance hit. Use with caution.
    yAccessor: d => d.average, // Custom yAccessor for one particular serie.
  }
}
```

A more complex example can be seen in the demo with dynamic oil prices.

### ChartContainer

The job of the `ChartContainer` is to hold the state of the charts. This means, the zoom transformation, the different x scales (main x scale and sub x scale for line/context chart) and the dynamic width of the charts.

### LineChart

Currently the only type of chart. The `LineChart` takes in 2 props on its own, `crosshairs` which is whether it should display crosshairs on the mouse position, and an `onMouseMove` function. `onMouseMove` gets called with the current x/y pixels and values for each of the series in the chart on hover. An example of this can be seen in the demos.

The `LineChart` renders one x axis, one y axis per serie and calculates the correct y domains for its series and applies the transformation sent from `ChartContainer` for all axis that's not specified as static.

### ContextChart

A timeline/overview chart and acts as a navigator. It's using the `baseDomain` as it's boundaries, and the `subDomain` as it's selected area. The `ContextChart` draws every serie on their individual y scales, but doesn't show any axis values. It's purely for navigating and getting an overview of how the series look on a broad absis.

### Axis

This charting library is ment for time series charting. Every yAxis has its own zoom (unless `staticDomain` is specified in the config) which is held by the `ChartContainer` and passed down through the `LineChart`. Using `d3` under the hood, it creates the axis, creates the necessary `<path>`s and rendering them directly as html elements. You should not have to interact with this component manually as it's rendered by the `LineChart` and `ContextChart`.

### Line

Pure component that's taking a single serie and its respective accessor functions (with the config accessor function as fallback) and calculates the path using `d3`.
