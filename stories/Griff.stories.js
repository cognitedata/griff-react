import React from 'react';
import moment from 'moment';
import { storiesOf } from '@storybook/react';
import { Griff, LineChart, Series, Collection } from '../build/src';

import { staticLoader } from './loaders';

const CHART_HEIGHT = 500;
const timeDomain = [+moment().subtract(24, 'days'), +moment()];

storiesOf('Griff', module)
  .addDecorator(story => (
    <div style={{ marginLeft: 'auto', marginRight: 'auto', width: '80%' }}>
      {story()}
    </div>
  ))
  .add('Empty', () => (
    <Griff loader={staticLoader} timeDomain={timeDomain}>
      <LineChart height={CHART_HEIGHT} />
    </Griff>
  ));

storiesOf('Griff/series', module)
  .add('Basic', () => (
    <Griff loader={staticLoader} timeDomain={timeDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" />
      <LineChart height={CHART_HEIGHT} />
    </Griff>
  ))
  .add('Data Domains', () => (
    <Griff loader={staticLoader} timeDomain={timeDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" yAccessor={d => +d.y + 2} />
      <LineChart height={CHART_HEIGHT} />
    </Griff>
  ))
  .add('Domains', () => (
    <Griff loader={staticLoader} timeDomain={timeDomain}>
      <Series id="1" color="steelblue" />
      <Series
        id="2"
        color="maroon"
        yAccessor={d => +d.y + 2}
        yDomain={[0, 10]}
      />
      <LineChart height={CHART_HEIGHT} />
    </Griff>
  ))
  .add('Subdomains', () => (
    <Griff loader={staticLoader} timeDomain={timeDomain}>
      <Series id="1" color="steelblue" />
      <Series
        id="2"
        color="maroon"
        yAccessor={d => +d.y + 2}
        ySubDomain={[0, 10]}
      />
      <LineChart height={CHART_HEIGHT} />
    </Griff>
  ))
  .add('Both domain and subdomain', () => (
    <Griff loader={staticLoader} timeDomain={timeDomain}>
      <Series id="1" color="steelblue" />
      <Series
        id="2"
        color="maroon"
        yAccessor={d => +d.y + 2}
        yDomain={[0, 10]}
        ySubDomain={[2, 5]}
      />
      <LineChart height={CHART_HEIGHT} />
    </Griff>
  ));

storiesOf('Griff/collections', module)
  .add('Basic', () => (
    <Griff loader={staticLoader} timeDomain={timeDomain}>
      <Collection id="all" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>
  ))
  .add('Data Domains', () => (
    <React.Fragment>
      <p>
        This collection should all have y-subdomain from <code>[2, 3]</code>
      </p>
      <Griff loader={staticLoader} timeDomain={timeDomain}>
        <Collection id="all" color="red" yAccessor={d => +d.y + 2}>
          <Series id="1" color="steelblue" />
          <Series id="2" color="maroon" />
        </Collection>
        <LineChart height={CHART_HEIGHT} />
      </Griff>
      <p>
        This collection should all have y-subdomain from <code>[0, 3]</code>
      </p>
      <Griff loader={staticLoader} timeDomain={timeDomain}>
        <Collection id="all" color="red">
          <Series id="1" color="steelblue" />
          <Series id="2" color="maroon" yAccessor={d => +d.y + 2} />
        </Collection>
        <LineChart height={CHART_HEIGHT} />
      </Griff>
    </React.Fragment>
  ))
  .add('Domains', () => (
    <React.Fragment>
      <p>
        The collections should all have y-domains from <code>[-10, 10]</code>
      </p>
      <Griff loader={staticLoader} timeDomain={timeDomain}>
        <Collection id="all" color="red">
          <Series id="1" color="steelblue" />
          <Series
            id="2"
            color="maroon"
            yAccessor={d => +d.y + 2}
            yDomain={[-10, 10]}
          />
        </Collection>
        <LineChart height={CHART_HEIGHT} />
      </Griff>
      <Griff loader={staticLoader} timeDomain={timeDomain}>
        <Collection id="all" color="red" yDomain={[-5, 5]}>
          <Series id="1" color="steelblue" />
          <Series
            id="2"
            color="maroon"
            yAccessor={d => +d.y + 2}
            yDomain={[-10, 10]}
          />
        </Collection>
        <LineChart height={CHART_HEIGHT} />
      </Griff>
      <Griff loader={staticLoader} timeDomain={timeDomain}>
        <Collection id="all" color="red" yDomain={[-10, 10]}>
          <Series id="1" color="steelblue" />
          <Series
            id="2"
            color="maroon"
            yAccessor={d => +d.y + 2}
            yDomain={[2, 3]}
          />
        </Collection>
        <LineChart height={CHART_HEIGHT} />
      </Griff>
    </React.Fragment>
  ))
  .add('Subdomains', () => (
    <React.Fragment>
      <p>
        The collections should all have y-subdomains from <code>[-10, 10]</code>
      </p>
      <Griff loader={staticLoader} timeDomain={timeDomain}>
        <Collection id="all" color="red">
          <Series id="1" color="steelblue" />
          <Series
            id="2"
            color="maroon"
            yAccessor={d => +d.y + 2}
            ySubDomain={[-10, 10]}
          />
        </Collection>
        <LineChart height={CHART_HEIGHT} />
      </Griff>
      <Griff loader={staticLoader} timeDomain={timeDomain}>
        <Collection id="all" color="red" ySubDomain={[-5, 5]}>
          <Series id="1" color="steelblue" />
          <Series
            id="2"
            color="maroon"
            yAccessor={d => +d.y + 2}
            ySubDomain={[-10, 10]}
          />
        </Collection>
        <LineChart height={CHART_HEIGHT} />
      </Griff>
      <Griff loader={staticLoader} timeDomain={timeDomain}>
        <Collection id="all" color="red" ySubDomain={[-10, 10]}>
          <Series id="1" color="steelblue" />
          <Series
            id="2"
            color="maroon"
            yAccessor={d => +d.y + 2}
            ySubDomain={[2, 3]}
          />
        </Collection>
        <LineChart height={CHART_HEIGHT} />
      </Griff>
    </React.Fragment>
  ))
  .add('Both domain and subdomain', () => (
    <Griff loader={staticLoader} timeDomain={timeDomain}>
      <Collection id="all" color="red">
        <Series id="1" color="steelblue" />
        <Series
          id="2"
          color="maroon"
          yAccessor={d => +d.y + 2}
          yDomain={[0, 10]}
          ySubDomain={[2, 5]}
        />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
    </Griff>
  ));
