import React from 'react';
import PropTypes from 'prop-types';
import AxisPlacement from './AxisPlacement';
import { axisPlacementType } from '../../utils/proptypes';

const propTypes = {
  contextChart: PropTypes.node,
  lineChart: PropTypes.node.isRequired,
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

const Layout = ({ contextChart, lineChart, xAxis, yAxis, yAxisPlacement }) => {
  const yAxes = [];
  let areas;

  switch (yAxisPlacement) {
    case AxisPlacement.LEFT:
      areas = "'yaxis chart' '. xaxis' '. context'";
      yAxes.push(axisContainer('yaxis')(yAxis, yAxisPlacement));
      break;
    case AxisPlacement.BOTH: {
      areas = "'yaxis-left chart yaxis-right' '. xaxis .' '. context .'";
      yAxes.push(axisContainer('yaxis-left')(yAxis, AxisPlacement.LEFT));
      yAxes.push(axisContainer('yaxis-right')(yAxis, AxisPlacement.RIGHT));
      break;
    }
    case AxisPlacement.RIGHT:
    case AxisPlacement.UNSPECIFIED:
    default:
      areas = "'chart yaxis' 'xaxis .' 'context .'";
      yAxes.push(axisContainer('yaxis')(yAxis, yAxisPlacement));
      break;
  }
  return (
    <div
      className="linechart-container"
      style={{
        display: 'grid',
        gridTemplateAreas: areas,
        height: '100%',
      }}
    >
      <div
        className="lines-container"
        style={{ gridArea: 'chart', height: '100%' }}
      >
        {lineChart}
      </div>

      {yAxes}

      <div
        className="x-axis-container"
        style={{ gridArea: 'xaxis', width: '100%' }}
      >
        {xAxis}
      </div>
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
