<!-- Place each sentence on a separate line for easy diffing. -->

# @cognitedata/griff-react

High-performance charting of time series with dynamic data in mind.
Using the power of React to render, with event-handling and maths by d3.

`griff-react` introduces the concept of dynamic data loading for displaying complex time series.
You provide a `loader` function which is in charge of fetching the data given input parameters.
For instance, if the current domain is 1 year, you might want to fetch daily aggregates instead of the raw process values.

## Slack

Join us on Slack at [cognite-community.slack.com](https://cognite-community.slack.com/messages/CKH5R0JH5).
(Get invited to join the Slack workspace [here](http://join-slack.cogniteapp.com))

## Storybook & demo

Our tip-of-tree Storybook can be found on [griff-master.surge.sh](https://griff-master.surge.sh)

## Test locally

```sh
git clone https://github.com/cognitedata/griff-react
yarn
yarn storybook #starts the stories
```

## Usage

`yarn add @cognite/griff-react`

or

`npm i @cognite/griff-react`

See examples in `stories/index.js`

## Concepts

### Series

The Series represents a single data stream.
This data stream can have data points across multiple dimensions (x, y, and time).
How these data points are rendered is controlled by the rendering properties, which can be set on a per-Series basis.

### Collection

A Collection represents a group of Series which should behave as one.
That is to say, they should be zoomed / translated / scaled as a single group.
The rendering properties of a Collection are passed down to the Series.

### Griff

The outermost component in the hierarchy, Griff holds all of the state for the system.
Specifically, it is responsible for managing the Series and Collections which should be rendered, and passes them on down to the rendering layer.

The data controlled by Griff is exposed through React's [Context](https://reactjs.org/docs/context.html) API, by way of `Griff.Context`.

### Data loading

Data loading happens through the `loader` function, which is provided to Griff.
This loader function is responsible for taking in a Series and information about the current state, and returning a Promise which will resolve a new Series object.
This resulting Series is then merged with the old one and then rendered.

The data loader can be called for several reasons.
The different reasons that the loader can be called are:

```js
MOUNTED, // First render of the chart
INTERVAL, // If you specify an update interval, it will be called every n seconds
NEW_LOADER, // The loader function changed
NEW_DOMAIN, // The outer domain changed,
NEW_SUBDOMAIN, // The user zoomed to a new subdomain.
UPDATE_POINTS_PER_SERIES, // The pointsPerSeries prop has changed
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
