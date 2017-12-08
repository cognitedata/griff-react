# cognitechart-react

High-performance charting of time series with dynamic data in mind. Using the
power of React to render, with event-handling and maths by d3.

`react-cognitechart` introduces the concept of dynamic data loading for
displaying complex time series. You provide a `loader` function which is in
charge of fetching the data given input parameters. For instance, if the current
domain is 1 year, you might want to fetch daily aggregates instead of raw
process value.

A more complex example will come soon.

### Storybook & demo: https://griff.surge.sh

## Test locally

```sh
git clone https://github.com/cognitedata/react-cognitechart
yarn
yarn start
```

Will run the local demo located at /demo/src/index.js

## Usage

See example in demo/src

## Loader

Example loader

```js
const loader = () => {
  const series = {
    1: { color: 'red', data: randomData(), id: 1 },
    2: { color: 'blue', data: randomData(), id: 2 }
  };
  return (domain, subDomain, config, oldSeries, reason) => {
    return series;
  };
};
```

The loader returns a function which the `<DataProvider />` will call whenever it
needs updated information. If your data is static - return `series` and it will
keep the data.

The `reason` parameter is a string describing why the `<DataProvider>` is
calling the function, and is one of the following: `MOUNTED`, `INTERVAL`,
`NEW_LOADER`, `NEW_DOMAIN`, `UPDATE_SUBDOMAIN`.

A simple loader which returns the same series over and over again would simply
be

```js
if (reason === 'NEW_LOADER') {
  return series;
}
return oldSeries;
```
