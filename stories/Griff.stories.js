import React from 'react';
import moment from 'moment';
import { storiesOf } from '@storybook/react';
import { Griff, LineChart, Series, Collection } from '../build/src';

import { staticLoader } from './loaders';
import GriffDebugger from './GriffDebugger';

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
      <GriffDebugger />
    </Griff>
  ))
  .add('Data Domains', () => (
    <Griff loader={staticLoader} timeDomain={timeDomain}>
      <Series id="1" color="steelblue" />
      <Series id="2" color="maroon" yAccessor={d => +d.y + 2} />
      <LineChart height={CHART_HEIGHT} />
      <GriffDebugger />
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
      <GriffDebugger />
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
      <GriffDebugger />
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
      <GriffDebugger />
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
      <GriffDebugger />
    </Griff>
  ))
  .add('Data Domains', () => (
    <Griff loader={staticLoader} timeDomain={timeDomain}>
      <Collection id="all" color="red">
        <Series id="1" color="steelblue" />
        <Series id="2" color="maroon" yAccessor={d => +d.y + 2} />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
      <GriffDebugger />
    </Griff>
  ))
  .add('Domains', () => (
    <Griff loader={staticLoader} timeDomain={timeDomain}>
      <Collection id="all" color="red">
        <Series id="1" color="steelblue" />
        <Series
          id="2"
          color="maroon"
          yAccessor={d => +d.y + 2}
          yDomain={[0, 10]}
        />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
      <GriffDebugger />
    </Griff>
  ))
  .add('Subdomains', () => (
    <Griff loader={staticLoader} timeDomain={timeDomain}>
      <Collection id="all" color="red">
        <Series id="1" color="steelblue" />
        <Series
          id="2"
          color="maroon"
          yAccessor={d => +d.y + 2}
          ySubDomain={[0, 10]}
        />
      </Collection>
      <LineChart height={CHART_HEIGHT} />
      <GriffDebugger />
    </Griff>
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
      <GriffDebugger />
    </Griff>
  ));
