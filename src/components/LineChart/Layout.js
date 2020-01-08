import React from 'react';
import PropTypes from 'prop-types';
import AxisPlacement from 'components/AxisPlacement';
import GriffPropTypes from 'utils/proptypes';

const propTypes = {
  contextChart: PropTypes.node,
  lineChart: PropTypes.node.isRequired,
  xAxis: PropTypes.node.isRequired,
  xAxisPlacement: GriffPropTypes.axisPlacement,
  yAxis: PropTypes.node.isRequired,
  yAxisPlacement: GriffPropTypes.axisPlacement,
};

const defaultProps = {
  xAxisPlacement: AxisPlacement.BOTTOM,
  yAxisPlacement: AxisPlacement.RIGHT,
  contextChart: null,
};

const xAxisContainer = area => (axis, placement) => (
  <div
    key={area}
    className="x-axis-container"
    style={{
      gridArea: area,
      display: 'flex',
      flexDirection: 'row',
      width: '100%',
    }}
  >
    {React.cloneElement(axis, { placement })}
  </div>
);

const yAxisContainer = area => (axis, placement) => (
  <div
    key={area}
    className="y-axis-container"
    style={{
      gridArea: area,
      display: 'flex',
      flexDirection: 'column',
    }}
  >
    {React.cloneElement(axis, { yAxisPlacement: placement })}
  </div>
);

const XY_GRIDS = {
  [AxisPlacement.BOTH]: {
    [AxisPlacement.BOTH]: [
      // formatting for readability
      '. xaxis-top .',
      'yaxis-left chart yaxis-right',
      '. xaxis-bottom .',
      '. context .',
    ],
    [AxisPlacement.LEFT]: [
      // formatting for readability
      '. xaxis-top',
      'yaxis chart',
      '. xaxis-bottom',
      '. context',
    ],
    [AxisPlacement.RIGHT]: [
      // formatting for readability
      'xaxis-top .',
      'chart yaxis',
      'xaxis-bottom .',
      'context .',
    ],
  },
  [AxisPlacement.BOTTOM]: {
    [AxisPlacement.BOTH]: [
      // formatting for readability
      'yaxis-left chart yaxis-right',
      '. xaxis .',
      '. context .',
    ],
    [AxisPlacement.LEFT]: [
      // formatting for readability
      'yaxis chart',
      '. xaxis',
      '. context',
    ],
    [AxisPlacement.RIGHT]: [
      // formatting for readability
      'chart yaxis',
      'xaxis .',
      'context .',
    ],
  },
  [AxisPlacement.TOP]: {
    [AxisPlacement.BOTH]: [
      // formatting for readability
      '. xaxis .',
      'yaxis-left chart yaxis-right',
      '. context .',
    ],
    [AxisPlacement.LEFT]: [
      // formatting for readability
      '. xaxis',
      'yaxis chart',
      '. context',
    ],
    [AxisPlacement.RIGHT]: [
      // formatting for readability
      'xaxis .',
      'chart yaxis',
      'context .',
    ],
  },
};

const Layout = ({
  contextChart,
  lineChart,
  xAxis,
  xAxisPlacement,
  yAxis,
  yAxisPlacement,
}) => {
  const xAxes = [];
  const yAxes = [];
  const areas = (
    XY_GRIDS[xAxisPlacement][yAxisPlacement] ||
    XY_GRIDS[AxisPlacement.BOTTOM][AxisPlacement.RIGHT]
  )
    .map(s => `'${s}'`)
    .join(' ');

  const gridTemplateSpec = axisPlacement => {
    switch (axisPlacement) {
      case AxisPlacement.BOTH:
        return 'auto 1fr auto auto';
      case AxisPlacement.LEFT:
      case AxisPlacement.TOP:
        return 'auto 1fr auto';
      default:
        return '1fr auto auto';
    }
  };

  switch (yAxisPlacement) {
    case AxisPlacement.BOTH: {
      yAxes.push(yAxisContainer('yaxis-left')(yAxis, AxisPlacement.LEFT));
      yAxes.push(yAxisContainer('yaxis-right')(yAxis, AxisPlacement.RIGHT));
      break;
    }
    case AxisPlacement.LEFT:
    case AxisPlacement.RIGHT:
    case AxisPlacement.UNSPECIFIED:
    default:
      yAxes.push(yAxisContainer('yaxis')(yAxis, yAxisPlacement));
      break;
  }

  switch (xAxisPlacement) {
    case AxisPlacement.BOTH: {
      xAxes.push(xAxisContainer('xaxis-top')(xAxis, AxisPlacement.TOP));
      xAxes.push(xAxisContainer('xaxis-bottom')(xAxis, AxisPlacement.BOTTOM));
      break;
    }
    case AxisPlacement.TOP:
    case AxisPlacement.BOTTOM:
    case AxisPlacement.UNSPECIFIED:
    default:
      xAxes.push(xAxisContainer('xaxis')(xAxis, xAxisPlacement));
      break;
  }

  return (
    <div
      className="linechart-container"
      style={{
        display: 'grid',
        gridTemplateAreas: areas,
        gridTemplateRows: gridTemplateSpec(xAxisPlacement),
        gridTemplateColumns: gridTemplateSpec(yAxisPlacement),
        height: '100%',
      }}
    >
      <div
        className="lines-container"
        style={{
          gridArea: 'chart',
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }}
      >
        {lineChart}
      </div>

      {yAxes}
      {xAxes}
      <div style={{ gridArea: 'spacer' }} />
      {contextChart && (
        <div
          className="context-container"
          style={{
            gridArea: 'context',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {contextChart}
        </div>
      )}
    </div>
  );
};

Layout.propTypes = propTypes;
Layout.defaultProps = defaultProps;

export default Layout;
