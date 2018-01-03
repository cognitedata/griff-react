import expect from 'expect';
import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';

import { DataProvider, ChartContainer } from 'src/';

describe('Component', () => {
  let node;

  beforeEach(() => {
    node = document.createElement('div');
  });

  afterEach(() => {
    unmountComponentAtNode(node);
  });

  it('Renders dataprovider', () => {
    const config = {
      yAxis: {
        width: 50,
        mode: 'every',
        accessor: d => d.value
      },
      xAxis: {
        accessor: d => d.timestamp
      },
      baseDomain: [Date.now() - 1000, Date.now()]
    };
    render(
      <DataProvider config={config} width={1000} height={500}>
        <ChartContainer />
      </DataProvider>,
      node,
      console.log
    );
  });
});
