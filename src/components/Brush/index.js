import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  handleColor: PropTypes.string,
  height: PropTypes.number.isRequired,
  onUpdateSelection: PropTypes.func.isRequired,
  selection: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectionColor: PropTypes.string,
  outsideColor: PropTypes.string,
  width: PropTypes.number.isRequired,
  handleWidth: PropTypes.number,
  zoomable: PropTypes.bool,
};

const defaultProps = {
  handleColor: '#333',
  selectionColor: 'none',
  outsideColor: '#777',
  zoomable: true,
  handleWidth: 2,
};

class Brush extends React.Component {
  state = {
    dragStartOverlay: null,
    dragStartSelection: null,
    isDraggingHandleEast: false,
    isDraggingHandleWest: false,
    isDraggingOverlay: false,
    isDraggingSelection: false,
  };

  componentDidMount() {
    window.addEventListener('mouseup', this.onMouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  onMouseDownOverlay = e => {
    const { zoomable } = this.props;
    if (!zoomable) {
      return;
    }
    this.setState({
      isDraggingOverlay: true,
      dragStartOverlay: e.nativeEvent.offsetX,
    });
  };

  onMouseDownHandleEast = () => {
    const { zoomable } = this.props;
    if (!zoomable) {
      return;
    }
    this.setState({
      isDraggingHandleEast: true,
    });
  };

  onMouseDownHandleWest = () => {
    const { zoomable } = this.props;
    if (!zoomable) {
      return;
    }
    this.setState({
      isDraggingHandleWest: true,
    });
  };

  onMouseDownSelection = e => {
    const { zoomable } = this.props;
    if (!zoomable) {
      return;
    }
    this.setState({
      isDraggingSelection: true,
      dragStartSelection: e.nativeEvent.offsetX,
    });
  };

  onMouseUpSelection = () => {
    const { zoomable } = this.props;
    if (!zoomable) {
      return;
    }
    this.setState({
      isDraggingSelection: false,
    });
  };

  onMouseUp = () => {
    const { zoomable } = this.props;
    if (!zoomable) {
      return;
    }
    this.setState({
      isDraggingHandleEast: false,
      isDraggingHandleWest: false,
      isDraggingOverlay: false,
      isDraggingSelection: false,
      dragStartOverlay: null,
      dragStartSelection: null,
    });
  };

  onMouseMove = e => {
    const { onUpdateSelection, zoomable } = this.props;
    const {
      isDraggingHandleEast,
      isDraggingHandleWest,
      isDraggingOverlay,
      isDraggingSelection,
    } = this.state;
    if (!zoomable) {
      return;
    }
    if (isDraggingHandleEast) {
      const position = e.nativeEvent.offsetX;
      const { selection } = this.props;
      if (position < selection[0]) {
        this.setState({
          isDraggingHandleEast: false,
          isDraggingHandleWest: true,
        });
        return;
      }
      const newSelection = [selection[0], position];
      onUpdateSelection(newSelection);
    } else if (isDraggingHandleWest) {
      const position = e.nativeEvent.offsetX;
      const { selection } = this.props;
      if (position > selection[1]) {
        this.setState({
          isDraggingHandleWest: false,
          isDraggingHandleEast: true,
        });
        return;
      }
      const newSelection = [position, selection[1]];
      this.onUpdateSelection(newSelection);
    } else if (isDraggingSelection) {
      const { selection, width } = this.props;
      const { dragStartSelection } = this.state;
      const position = e.nativeEvent.offsetX;
      const dx = position - dragStartSelection;
      const newSelection = selection.map(d => d + dx);
      if (newSelection[0] >= 0 && newSelection[1] <= width) {
        this.setState({
          dragStartSelection: position,
        });
        onUpdateSelection(newSelection);
      }
    } else if (isDraggingOverlay) {
      const { dragStartOverlay } = this.state;
      const newSelection = [dragStartOverlay, e.nativeEvent.offsetX].sort(
        (a, b) => a - b
      );
      onUpdateSelection(newSelection);
    }
  };

  onUpdateSelection = selection => {
    const { onUpdateSelection } = this.props;
    onUpdateSelection(selection);
  };

  render() {
    const {
      width,
      height,
      selection,
      selectionColor,
      outsideColor,
      handleColor,
      zoomable,
      handleWidth,
    } = this.props;
    const selectionWidth = selection[1] - selection[0];
    const disabledCursor = zoomable ? null : 'inherit';
    const handleTargetWidth = 10;
    return (
      <g fill="none" stoke="#777" onMouseMove={this.onMouseMove}>
        <rect
          className="before-selection"
          fill={outsideColor}
          fillOpacity={0.3}
          stroke="#fff"
          shapeRendering="crispEdges"
          width={Math.max(0, selection[0])}
          height={height}
          x={0}
          y={0}
        />
        <rect
          className="after-selection"
          fill={outsideColor}
          fillOpacity={0.3}
          stroke="#fff"
          shapeRendering="crispEdges"
          width={Math.max(0, width - selection[1])}
          height={height}
          x={selection[1]}
          y={0}
        />
        <rect
          className="overlay"
          pointerEvents="all"
          cursor={disabledCursor || 'crosshair'}
          x={0}
          y={0}
          fill="none"
          width={width}
          height={height}
          onMouseDown={this.onMouseDownOverlay}
        />
        <rect
          className="selection"
          cursor={disabledCursor || 'move'}
          fill={selectionColor}
          fillOpacity={0.3}
          pointerEvents="all"
          shapeRendering="crispEdges"
          width={selectionWidth}
          height={height}
          x={selection[0]}
          y={0}
          onMouseDown={this.onMouseDownSelection}
        />
        <path
          className="handle handle--west"
          stroke={handleColor}
          strokeWidth={handleWidth}
          d={`M ${selection[0]} 0 V ${height}`}
        />
        <rect
          className="handle-target handle-target--west"
          cursor={disabledCursor || 'ew-resize'}
          x={selection[0] - handleTargetWidth / 2}
          y={0}
          width={handleTargetWidth}
          height={height}
          fill="none"
          pointerEvents="all"
          onMouseDown={this.onMouseDownHandleWest}
        />
        <path
          className="handle handle--east"
          stroke={handleColor}
          strokeWidth={handleWidth}
          d={`M ${selection[1]} 0 V ${height}`}
        />
        <rect
          className="handle-target handle-target--east"
          cursor={disabledCursor || 'ew-resize'}
          x={selection[1] - handleTargetWidth / 2}
          y={0}
          width={handleTargetWidth}
          height={height}
          fill="none"
          pointerEvents="all"
          onMouseDown={this.onMouseDownHandleEast}
        />
      </g>
    );
  }
}

Brush.propTypes = propTypes;
Brush.defaultProps = defaultProps;

export default Brush;
