// Not implemented yet. Should write our own brush component,
// that's the last thing we're not handling ourselves - will mess up rendering cycle (i think)

import React from 'react';
import PropTypes from 'prop-types';

class Brush extends React.Component {
  state = {
    isDraggingOverlay: false,
    isDraggingHandleWest: false,
    isDraggingHandleEast: false,
    isDraggingSelection: false,
    dragStartOverlay: null,
    dragStartSelection: null,
  };

  componentDidMount() {
    window.addEventListener('mouseup', this.onMouseUp);
  }

  componentWillUnmount() {
    window.removeEventListener('mouseup', this.onMouseUp);
  }

  onMouseDownOverlay = e => {
    this.setState({
      isDraggingOverlay: true,
      dragStartOverlay: e.nativeEvent.offsetX,
    });
  };

  onMouseDownHandleEast = () => {
    this.setState({
      isDraggingHandleEast: true,
    });
  };

  onMouseDownHandleWest = () => {
    this.setState({
      isDraggingHandleWest: true,
    });
  };

  onMouseDownSelection = e => {
    this.setState({
      isDraggingSelection: true,
      dragStartSelection: e.nativeEvent.offsetX,
    });
  };

  onMouseUpSelection = () => {
    this.setState({
      isDraggingSelection: false,
    });
  };

  onMouseUp = () => {
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
    if (this.state.isDraggingHandleEast) {
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
      this.props.onUpdateSelection(newSelection);
    } else if (this.state.isDraggingHandleWest) {
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
    } else if (this.state.isDraggingSelection) {
      const { selection, width } = this.props;
      const { dragStartSelection } = this.state;
      const position = e.nativeEvent.offsetX;
      const dx = position - dragStartSelection;
      const newSelection = selection.map(d => d + dx);
      if (newSelection[0] >= 0 && newSelection[1] <= width) {
        this.setState({
          dragStartSelection: position,
        });
        this.props.onUpdateSelection(newSelection);
      }
    } else if (this.state.isDraggingOverlay) {
      const { dragStartOverlay } = this.state;
      const newSelection = [dragStartOverlay, e.nativeEvent.offsetX].sort(
        (a, b) => a - b
      );
      this.props.onUpdateSelection(newSelection);
    }
  };

  onUpdateSelection = selection => {
    this.props.onUpdateSelection(selection);
  };

  render() {
    const { width, height, selectionColor, handleColor } = this.props;
    const { selection } = this.props;
    const selectionWidth = selection[1] - selection[0];
    return (
      <g fill="none" stoke="#777" onMouseMove={this.onMouseMove}>
        <rect
          className="overlay"
          pointerEvents="all"
          cursor="crosshair"
          x={0}
          y={0}
          width={width}
          height={height}
          onMouseDown={this.onMouseDownOverlay}
        />
        <rect
          className="selection"
          cursor="move"
          fill={selectionColor}
          fillOpacity={0.3}
          stroke="#fff"
          shapeRendering="crispEdges"
          width={selectionWidth}
          height={height}
          x={selection[0]}
          y={0}
          onMouseDown={this.onMouseDownSelection}
        />
        <rect
          className="handle handle--west"
          cursor="ew-resize"
          x={selection[0] - 3}
          y={0}
          width={6}
          height={height}
          fill={handleColor}
          onMouseDown={this.onMouseDownHandleWest}
        />
        <rect
          className="handle handle-east"
          cursor="ew-resize"
          x={selection[1] - 3}
          y={0}
          width={6}
          height={height}
          fill={handleColor}
          onMouseDown={this.onMouseDownHandleEast}
        />
      </g>
    );
  }
}

Brush.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  selection: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectionColor: PropTypes.string,
  handleColor: PropTypes.string,
  onUpdateSelection: PropTypes.func.isRequired,
};

Brush.defaultProps = {
  selectionColor: '#777',
  handleColor: 'blue',
};

export default Brush;
