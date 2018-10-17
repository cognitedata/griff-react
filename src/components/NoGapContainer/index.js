import React from 'react';
import PropTypes from 'prop-types';

const NoGapContainer = ({ children }) => (
  <div style={{ width: '100%', fontSize: 0 }}>{children}</div>
);

NoGapContainer.propTypes = {
  children: PropTypes.node.isRequired,
};

export default NoGapContainer;
