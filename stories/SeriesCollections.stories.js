import React from 'react';
import { storiesOf } from '@storybook/react';
import {
  AxisDisplayMode,
  Griff,
  LineChart,
  Collection,
  Series,
} from '../build/src';
import { staticLoader } from './loaders';

const staticXDomain = [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()];
const CHART_HEIGHT = 500;

storiesOf('Series Collections', module)
  .add('Single collection', () => [
    <Griff key="simple" timeDomain={staticXDomain} loader={staticLoader}>
      <Collection id="all" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
    // <Griff
    //   key="scaled"
    //   timeDomain={staticXDomain}
    //   loader={staticLoader}
    // >
    //   <Collection id="all" color="red">
    //     <Series id="1" color="steelblue" />
    //     <Series id="2" color="maroon" yAccessor={d => d.value + 2} />
    //   </Collection>
    //   <LineChart height={CHART_HEIGHT} />
    // </Griff>,
  ])
  .add('Multiple collections', () => (
    <Griff timeDomain={staticXDomain} loader={staticLoader}>
      <Collection id="1+2" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <Collection id="3+4" color="gray">
        <Series id="3" color="orange" />
        <Series id="4" color="green" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>
  ))
  .add('Mixed items', () => (
    <Griff timeDomain={staticXDomain} loader={staticLoader}>
      <Collection id="1+2" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <Series id="3" color="orange" />
      <LineChart height={CHART_HEIGHT} />
    </Griff>
  ))
  .add('drawPoints', () => [
    <Griff key="default" timeDomain={staticXDomain} loader={staticLoader}>
      <Collection id="1+2" color="red" drawPoints>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
    <Griff key="override" timeDomain={staticXDomain} loader={staticLoader}>
      <Collection id="1+2" color="red" drawPoints>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" drawPoints={false} />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
  ])
  .add('hidden', () => [
    <Griff key="default" timeDomain={staticXDomain} loader={staticLoader}>
      <Collection id="1+2" color="red" hidden>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
    <Griff key="preference" timeDomain={staticXDomain} loader={staticLoader}>
      <Collection id="1+2" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" hidden />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
    <Griff key="override" timeDomain={staticXDomain} loader={staticLoader}>
      <Collection id="1+2" color="red" hidden>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" hidden={false} />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
  ])
  .add('strokeWidth', () => [
    <Griff key="default" timeDomain={staticXDomain} loader={staticLoader}>
      <Collection id="1+2" color="red" strokeWidth={3}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
    <Griff key="preference" timeDomain={staticXDomain} loader={staticLoader}>
      <Collection id="1+2" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" strokeWidth={2} />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
    <Griff key="override" timeDomain={staticXDomain} loader={staticLoader}>
      <Collection id="1+2" color="red" strokeWidth={3}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" strokeWidth={1} />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
  ])
  .add('y0Accessor', () => {
    const y0Accessor = d => d.value - 0.5;
    const y1Accessor = d => d.value + 0.5;
    return [
      <Griff key="default" timeDomain={staticXDomain} loader={staticLoader}>
        <Collection
          id="1+2"
          color="red"
          y0Accessor={y0Accessor}
          y1Accessor={y1Accessor}
        >
          <Series id="1" color="steelblue" />
          <Series id="2" color="maroon" />
        </Collection>
        <LineChart height={CHART_HEIGHT} />
      </Griff>,
      <Griff key="preference" timeDomain={staticXDomain} loader={staticLoader}>
        <Collection id="1+2" color="red">
          <Series id="1" color="steelblue" />
          <Series
            id="2"
            color="maroon"
            y0Accessor={y0Accessor}
            y1Accessor={y1Accessor}
          />
        </Collection>
        <LineChart height={CHART_HEIGHT} />
      </Griff>,
      <Griff key="override" timeDomain={staticXDomain} loader={staticLoader}>
        <Collection
          id="1+2"
          color="red"
          y0Accessor={y0Accessor}
          y1Accessor={y1Accessor}
        >
          <Series id="1" color="steelblue" />
          <Series id="2" color="maroon" y0Accessor={null} y1Accessor={null} />
        </Collection>
        <LineChart height={CHART_HEIGHT} />
      </Griff>,
    ];
  })
  .add('yAxisDisplayMode', () => [
    <Griff key="default" timeDomain={staticXDomain} loader={staticLoader}>
      <Collection id="1+2" color="red" yAxisDisplayMode={AxisDisplayMode.NONE}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
    <Griff key="override" timeDomain={staticXDomain} loader={staticLoader}>
      <Collection id="1+2" color="red" yAxisDisplayMode={AxisDisplayMode.NONE}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" yAxisDisplayMode={AxisDisplayMode.ALL} />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
  ])
  .add('yDomain', () => [
    // The yDomain is provided on the collection; the axis should have this
    // yDomain.
    <Griff key="default" timeDomain={staticXDomain} loader={staticLoader}>
      <Collection id="1+2" color="red" yDomain={[-4, 4]}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
    // The yDomain is also provided on one series -- this override should be
    // ignored because it is ignored when in a collection.
    <Griff key="override" timeDomain={staticXDomain} loader={staticLoader}>
      <Collection id="1+2" color="red" yDomain={[-5, 5]}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" yDomain={[0.5, 1]} />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
    // The two series are offset so that the context chart behavior can be
    // verified. The context chart should use the same initial (unscaled)
    // yDomain as the collection.
    <Griff key="scaled" timeDomain={staticXDomain} loader={staticLoader}>
      <Collection id="1+2" color="red" yDomain={[-6, 6]}>
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" yAccessor={d => d.value + 2} />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
  ])
  .add('colors', () => [
    <Griff key="default" timeDomain={staticXDomain} loader={staticLoader}>
      <Collection id="1+2" color="red">
        <Series id="1" />
        <Series id="2" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
    // No color is specified; YAxis should use its default color.
    <Griff key="unspecified" timeDomain={staticXDomain} loader={staticLoader}>
      <Collection id="1+2">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
    // A color is specified; the series' colors should override.
    <Griff key="override" timeDomain={staticXDomain} loader={staticLoader}>
      <Collection id="1+2" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>,
  ]);
