import React from 'react';
import PropTypes from 'prop-types';
import AxisPlacement from '../AxisPlacement';
import { axisPlacementType } from '../../utils/proptypes';

const propTypes = {
  chart: PropTypes.node.isRequired,
  xAxis: PropTypes.node.isRequired,
  yAxis: PropTypes.node.isRequired,
  yAxisPlacement: axisPlacementType,
};

const defaultProps = {
  yAxisPlacement: AxisPlacement.RIGHT,
  contextChart: null,
};

const axisContainer = area => (axis, placement) => (
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

const Layout = ({ chart, xAxis, yAxis, yAxisPlacement }) => {
  const yAxes = [];
  let areas;

  const quote = s => `'${s}'`;

  switch (yAxisPlacement) {
    case AxisPlacement.LEFT:
      areas = [
        // formatting for readability
        'yaxis chart',
        '. xaxis',
        '. context',
      ]
        .map(quote)
        .join(' ');
      yAxes.push(axisContainer('yaxis')(yAxis, yAxisPlacement));
      break;
    case AxisPlacement.BOTH: {
      areas = [
        // formatting for readability
        'yaxis-left chart yaxis-right',
        '. xaxis .',
        '. context .',
      ]
        .map(quote)
        .join(' ');
      yAxes.push(axisContainer('yaxis-left')(yAxis, AxisPlacement.LEFT));
      yAxes.push(axisContainer('yaxis-right')(yAxis, AxisPlacement.RIGHT));
      break;
    }
    case AxisPlacement.RIGHT:
    case AxisPlacement.UNSPECIFIED:
    default:
      areas = [
        // formatting for readability
        'chart yaxis',
        'xaxis .',
        'context .',
      ]
        .map(quote)
        .join(' ');
      yAxes.push(axisContainer('yaxis')(yAxis, yAxisPlacement));
      break;
  }
  return (
    <div
      className="scatterplot-container"
      style={{
        display: 'grid',
        gridTemplateAreas: areas,
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

      <div
        className="x-axis-container"
        style={{ gridArea: 'xaxis', width: '100%' }}
      >
        {xAxis}
      </div>
    </div>
  );
};

Layout.propTypes = propTypes;
Layout.defaultProps = defaultProps;

export default Layout;
