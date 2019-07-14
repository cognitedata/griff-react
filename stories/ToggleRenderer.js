import React from 'react';
import PropTypes from 'prop-types';
import { staticLoader } from './loaders';
import { makePrintable } from './Series.stories';
import {
  AxisPlacement,
  AxisDisplayMode,
  Collection,
  LineChart,
  Series,
  Griff,
} from '../build/src';

const pointRenderer = (
  d,
  i,
  arr,
  { x, y, color, opacity, opacityAccessor }
) => {
  const width = Math.floor(((d.value * 100) % 5) + 3);
  return (
    <circle
      key={`${x}-${y}`}
      className="point"
      r={width / 2}
      opacity={opacityAccessor ? opacityAccessor(d, i, arr) : opacity}
      cx={x}
      cy={y}
      fill={color}
    />
  );
};
pointRenderer.toString = () => 'custom renderer';

const pointWidthAccessor = d => Math.floor(((d.value * 100) % 5) + 3);
pointWidthAccessor.toString = () => 'custom widths';

const opacityAccessor = d => ((d.value * 100) % 100) / 100;
opacityAccessor.toString = () => 'custom opacity';

const OPTIONS = {
  yDomain: [[-1, 2], [0, 10], [0.25, 0.75]].map(makePrintable),
  ySubDomain: [[-1, 2], [0, 10], [0.25, 0.75]].map(makePrintable),
  color: ['maroon', 'steelblue', 'darkgreen', 'lightsalmon'],
  collectionId: ['missing-collection'],
  drawLines: [true, false],
  drawPoints: [true, false, pointRenderer],
  pointWidth: [4, 6, 8, 10],
  pointWidthAccessor: [pointWidthAccessor],
  opacity: [0.25, 0.5, 0.75, 1],
  opacityAccessor: [opacityAccessor],
  strokeWidth: [1, 2, 3, 4, 5, 6],
  hidden: [true, false],
  step: [true, false],
  zoomable: [true, false],
  name: ['readable-name'],
  yAxisPlacement: [
    AxisPlacement.LEFT,
    AxisPlacement.RIGHT,
    AxisPlacement.BOTH,
    AxisPlacement.UNSPECIFIED,
  ],
  yAxisDisplayMode: [
    AxisDisplayMode.ALL,
    AxisDisplayMode.COLLAPSED,
    AxisDisplayMode.NONE,
  ],
};

class ToggleRenderer extends React.Component {
  state = {};

  setProperty = (id, key, value) => () => {
    this.setState(state => ({
      [key]: {
        ...state[key],
        [id]: value,
      },
    }));
  };

  getItemOptions = itemId =>
    Object.keys(OPTIONS).reduce((acc, option) => {
      const { [option]: values = {} } = this.state;
      return {
        ...acc,
        [option]: values[itemId],
      };
    }, {});

  renderToggles = key => {
    const { collectionIds, seriesIds } = this.props;
    const { [key]: currentValues = {} } = this.state;
    return [...collectionIds, ...seriesIds].map(id => {
      const possibleValues =
        key === 'collectionId'
          ? [...collectionIds, OPTIONS[key]]
          : OPTIONS[key];
      return (
        <div
          key={id}
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 4,
            paddingTop: 4,
            borderTop: '1px solid #aaa',
          }}
        >
          {possibleValues.map(value => (
            <button
              key={`${key}-${value}`}
              disabled={currentValues[id] === value}
              type="button"
              onClick={this.setProperty(id, key, value)}
            >
              {String(value)}
            </button>
          ))}
          <button
            disabled={currentValues[id] === undefined}
            type="button"
            onClick={this.setProperty(id, key, undefined)}
          >
            reset to default
          </button>
        </div>
      );
    });
  };

  renderPropertyTable = () => {
    const { collectionIds, seriesIds } = this.props;
    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `auto ${[...collectionIds, ...seriesIds]
            .map(() => '1fr')
            .join(' ')}`,
        }}
      >
        <div style={{ textAlign: 'center' }}>prop</div>
        {[...collectionIds, ...seriesIds].map(id => (
          <div
            key={id}
            style={{
              textAlign: 'center',
            }}
          >
            {id}
          </div>
        ))}
        {Object.keys(OPTIONS).map(option => (
          <React.Fragment key={option}>
            <div
              key={option}
              style={{
                textAlign: 'right',
                paddingRight: '0.5em',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                marginTop: 4,
                paddingTop: 4,
                borderTop: '1px solid #aaa',
                fontFamily: 'monospace',
              }}
            >
              {option}
            </div>
            {this.renderToggles(option)}
          </React.Fragment>
        ))}
      </div>
    );
  };

  render() {
    const { collectionIds, loader, seriesIds, timeDomain } = this.props;
    return (
      <div>
        <Griff loader={loader} timeDomain={timeDomain}>
          {collectionIds.map(collectionId => (
            <Collection
              key={collectionId}
              id={collectionId}
              {...this.getItemOptions(collectionId)}
            >
              {seriesIds
                .filter(s => s.collectionId === collectionId)
                .map(id => (
                  <Series key={id} id={id} {...this.getItemOptions(id)} />
                ))}
            </Collection>
          ))}
          {seriesIds
            .filter(s => s.collectionId === undefined)
            .map(id => (
              <Series key={id} id={id} {...this.getItemOptions(id)} />
            ))}
          <LineChart height={400} />
        </Griff>
        {this.renderPropertyTable()}
      </div>
    );
  }
}

ToggleRenderer.propTypes = {
  loader: PropTypes.func,
  timeDomain: PropTypes.arrayOf(PropTypes.number),
  collectionIds: PropTypes.arrayOf(PropTypes.string),
  seriesIds: PropTypes.arrayOf(PropTypes.string),
};

ToggleRenderer.defaultProps = {
  loader: staticLoader,
  timeDomain: [Date.now() - 1000 * 60 * 60 * 24 * 30, Date.now()],
  collectionIds: [],
  seriesIds: [],
};

export default ToggleRenderer;
