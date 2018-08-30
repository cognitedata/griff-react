# griff-react

High-performance charting of time series with dynamic data in mind.
Using the power of React to render, with event-handling and maths by d3.

`griff-react` introduces the concept of dynamic data loading for displaying complex time series.
You provide a `loader` function which is in charge of fetching the data given input parameters.
For instance, if the current domain is 1 year, you might want to fetch daily aggregates instead of the raw process values.

### Storybook & demo

Griff uses living documentation through the use of [storybook](https://github.com/storybooks/storybook).
The latest version is auto-deployed at [griff-master.surge.sh](https://griff-master.surge.sh/).

## Test locally

```sh
git clone https://github.com/cognitedata/griff-react
yarn
yarn start #starts the demo
yarn storybook #starts the stories
```

## Usage

`yarn add @cognite/griff-react`

or

`npm i @cognite/griff-react`

See examples in `demo/src` and `stories/index.js`

## Concepts

### DataProvider

The outermost component in the hierarchy.
The DataProvider is in charge of handling the data for all the other components.
It uses React's new context API to expose the properties sent.

```js
DataProvider.propTypes = {
  baseDomain: PropTypes.arrayOf(PropTypes.number).isRequired,
  subDomain: PropTypes.arrayOf(PropTypes.number),
  updateInterval: PropTypes.number,
  yAccessor: PropTypes.func,
  y0Accessor: PropTypes.func,
  y1Accessor: PropTypes.func,
  xAccessor: PropTypes.func,
  yAxisWidth: PropTypes.number,
  ySubDomain: PropTypes.arrayOf(PropTypes.number.isRequired),
  pointsPerSeries: PropTypes.number,
  children: PropTypes.node.isRequired,
  defaultLoader: PropTypes.func,
  series: seriesPropType.isRequired,
  collections: GriffPropTypes.collections,
  // (subDomain) => null
  onSubDomainChanged: PropTypes.func,
};
```

The series prop type is

```js
export const singleSeriePropType = PropTypes.shape({
  id: idPropType.isRequired,
  collectionId: idPropType,
  color: PropTypes.string,
  hidden: PropTypes.bool,
  strokeWidth: PropTypes.number,
  drawPoints: PropTypes.bool,
  loader: PropTypes.func,
  step: PropTypes.bool,
  xAccessor: PropTypes.func,
  yAccessor: PropTypes.func,
  y0Accessor: PropTypes.func,
  y1Accessor: PropTypes.func,
  yDomain: PropTypes.arrayOf(PropTypes.number.isRequired),
  ySubDomain: PropTypes.arrayOf(PropTypes.number.isRequired),
  yAxisDisplayMode: PropTypes.shape({
    // See AxisDisplayMode
    id: PropTypes.string.isRequired,
    width: PropTypes.func.isRequired,
  }),
});
```

### The data loader

The thing that separates this library with other libraries is the concept of the data loader.
The data loader is a function that gets called by the `DataProvider` with information about the current state of the chart as well as the reason why it's called.
The different reasons are

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

const loader = ({ id, oldSeries, reason }) => {
  if (reason === 'MOUNTED') {
    // Get data from somewhere, the DataProvider has mounted
    return data;
  }
  return oldSeries.data;
};
```

The loader will override the `series` if same keys are provided properties sent to the `DataProvider.`.

## Branches

Active development happens on the `master` branch -- changes here will be published as a prerelease of the N+1 release.
As of this writing, `master` will eventually become the `0.3.0` release, so its version in `package.json` is `0.3.0-0`.

When it is time cut the `0.3.0` release, a `0.3` branch will be created, and `package.json`'s `version` field will have the prerelease portion removed.
Then `master`'s `package.json` will be given a version of `0.4.0-0`.

Changes to older versions will need to be merged into release branches as well as the `master` branch, unless it is a specific fix, relevant to only that version.

### Publishing

To publish versions, run `yarn release`.
This will determine the correct version number, publish the release, and then push the new tag to GitHub.
As of `0.3.0`, this is automatically run by Jenkins.
