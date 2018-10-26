import React from 'react';
import PropTypes from 'prop-types';
import AxisPlacement from '../AxisPlacement';
import GriffPropTypes from '../../utils/proptypes';

const propTypes = {
  chart: PropTypes.node.isRequired,
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
    ],
    [AxisPlacement.LEFT]: [
      // formatting for readability
      '. xaxis-top',
      'yaxis chart',
      '. xaxis-bottom',
    ],
    [AxisPlacement.RIGHT]: [
      // formatting for readability
      'xaxis-top .',
      'chart yaxis',
      'xaxis-bottom .',
    ],
  },
  [AxisPlacement.BOTTOM]: {
    [AxisPlacement.BOTH]: [
      // formatting for readability
      'yaxis-left chart yaxis-right',
      '. xaxis .',
    ],
    [AxisPlacement.LEFT]: [
      // formatting for readability
      'yaxis chart',
      '. xaxis',
    ],
    [AxisPlacement.RIGHT]: [
      // formatting for readability
      'chart yaxis',
      'xaxis .',
    ],
  },
  [AxisPlacement.TOP]: {
    [AxisPlacement.BOTH]: [
      // formatting for readability
      '. xaxis .',
      'yaxis-left chart yaxis-right',
    ],
    [AxisPlacement.LEFT]: [
      // formatting for readability
      '. xaxis',
      'yaxis chart',
    ],
    [AxisPlacement.RIGHT]: [
      // formatting for readability
      'xaxis .',
      'chart yaxis',
    ],
  },
};

const Layout = ({ chart, xAxis, xAxisPlacement, yAxis, yAxisPlacement }) => {
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
        return 'auto 1fr auto';
      case AxisPlacement.LEFT:
      case AxisPlacement.TOP:
        return 'auto 1fr';
      default:
        return '1fr auto';
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
      className="scatterplot-container"
      style={{
        display: 'grid',
        gridTemplateAreas: areas,
        gridTemplateColumns: gridTemplateSpec(yAxisPlacement),
        gridTemplateRows: gridTemplateSpec(xAxisPlacement),
        height: '100%',
      }}
    >
      <div
        className="chart-container"
        style={{ gridArea: 'chart', height: '100%' }}
      >
        {chart}
      </div>

      {yAxes}
      {xAxes}
    </div>
  );
};

Layout.propTypes = propTypes;
Layout.defaultProps = defaultProps;

export default Layout;
