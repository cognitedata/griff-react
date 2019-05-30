import React from 'react';
import { ScalerContext } from '../build/src';

export default () => (
  <ScalerContext.Consumer>
    {({ collections, collectionsById, series, seriesById }) => (
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div>
          <h3 style={{ fontFamily: 'monospace' }}>collectionsById</h3>
          <pre>
            {JSON.stringify(
              Object.keys(collectionsById).reduce(
                (acc, id) => ({
                  ...acc,
                  [id]: collectionsById[id],
                }),
                {}
              ),
              null,
              2
            )}
          </pre>
        </div>
        <div>
          <h3 style={{ fontFamily: 'monospace' }}>collections</h3>
          <pre>{JSON.stringify(collections, null, 2)}</pre>
        </div>
        <div>
          <h3 style={{ fontFamily: 'monospace' }}>seriesById</h3>
          <pre>
            {JSON.stringify(
              Object.keys(seriesById).reduce(
                (acc, id) => ({
                  ...acc,
                  [id]: { ...seriesById[id], data: '/* SNIP */' },
                }),
                {}
              ),
              null,
              2
            )}
          </pre>
        </div>
        <div>
          <h3 style={{ fontFamily: 'monospace' }}>series</h3>
          <pre>
            {JSON.stringify(
              series.map(s => ({ ...s, data: '/* SNIP */' })),
              null,
              2
            )}
          </pre>
        </div>
      </div>
    )}
  </ScalerContext.Consumer>
);
