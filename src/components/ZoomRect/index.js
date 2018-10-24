import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import isEqual from 'lodash.isequal';
import ScalerContext from '../../context/Scaler';
import GriffPropTypes from '../../utils/proptypes';

const propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  itemIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
  ).isRequired,
  zoomAxes: PropTypes.shape({
    x: PropTypes.bool,
    y: PropTypes.bool,
    time: PropTypes.bool,
  }).isRequired,

  onMouseDown: PropTypes.func,
  onMouseUp: PropTypes.func,
  onMouseMove: PropTypes.func,
  onMouseOut: PropTypes.func,
  onClick: PropTypes.func,
  onDoubleClick: PropTypes.func,

  // These are provided by Griff.
  updateDomains: GriffPropTypes.updateDomains.isRequired,
  subDomainsByItemId: GriffPropTypes.subDomainsByItemId.isRequired,
};

const defaultProps = {
  onMouseDown: null,
  onMouseUp: null,
  onMouseMove: null,
  onMouseOut: null,
  onClick: null,
  onDoubleClick: null,
};

class ZoomRect extends React.Component {
  componentDidMount() {
    const { width, height } = this.props;
    this.zoom = d3
      .zoom()
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]]);
    this.rectSelection = d3.select(this.zoomNode);
    this.syncZoomingState();
  }

  componentDidUpdate(prevProps) {
    const { zoomAxes: prevZoomAxes } = prevProps;
    const { zoomAxes: currZoomAxes } = this.props;
    if (!isEqual(prevZoomAxes, currZoomAxes)) {
      this.syncZoomingState();
    }
  }

  onTouchStart = () => {
    const {
      event: { touches },
    } = d3;
    if (touches.length === 1) {
      const [touch] = touches;
      const { pageX: x, pageY: y } = touch;
      this.lastTouch = {
        time: x,
        x,
        y,
      };
    } else if (touches.length === 2) {
      const [touchOne, touchTwo] = touches;
      this.lastDeltas = {
        time: Math.abs(touchOne.pageX - touchTwo.pageX),
        x: Math.abs(touchOne.pageX - touchTwo.pageX),
        y: Math.abs(touchOne.pageY - touchTwo.pageY),
      };
    }
  };

  // TODO: A lot of this is duplicated with `zoomed` -- maybe they can be
  // consolidated?
  onTouchMove = () => {
    const { width, height } = this.props;

    const distances = {
      time: width,
      x: width,
      y: -height,
    };

    const {
      event: { touches },
    } = d3;
    let updates = null;
    if (touches.length === 1) {
      // If there was only one touch, then it was a drag event.
      updates = this.performTouchDrag(touches, distances);
    } else if (touches.length === 2) {
      // If there were two, then it is a zoom event.
      updates = this.performTouchZoom(touches, distances);
    } else {
      // We don't support more complicated gestures.
    }
    if (updates) {
      this.props.updateDomains(updates);
    }
  };

  onTouchEnd = () => {
    const {
      event: { touches },
    } = d3;
    if (touches.length === 0) {
      this.lastTouch = null;
    } else if (touches.length === 1) {
      this.lastDeltas = null;
      const [touch] = touches;
      const { pageX: x, pageY: y } = touch;
      this.lastTouch = {
        time: x,
        x,
        y,
      };
    }
  };

  performTouchDrag = (touches, distances) => {
    const { itemIds, subDomainsByItemId, zoomAxes } = this.props;
    const [touch] = touches;
    const newTouchPosition = {
      time: touch.pageX,
      x: touch.pageX,
      y: touch.pageY,
    };
    const updates = {};
    itemIds.forEach(itemId => {
      updates[itemId] = {};
      ['x', 'y', 'time'].filter(axis => zoomAxes[axis]).forEach(axis => {
        const subDomain = (subDomainsByItemId[itemId] || {})[axis];
        const subDomainRange = subDomain[1] - subDomain[0];
        let newSubDomain = null;
        const percentMovement =
          subDomainRange *
          ((this.lastTouch[axis] - newTouchPosition[axis]) / distances[axis]);
        newSubDomain = subDomain.map(bound => bound + percentMovement);
        if (newSubDomain) {
          updates[itemId][axis] = newSubDomain;
        }
      });
    });
    this.lastTouch = { ...newTouchPosition };
    return updates;
  };

  performTouchZoom = (touches, distances) => {
    const { itemIds, subDomainsByItemId, zoomAxes } = this.props;
    const [touchOne, touchTwo] = touches;
    const deltas = {
      time: Math.abs(touchOne.pageX - touchTwo.pageX),
      x: Math.abs(touchOne.pageX - touchTwo.pageX),
      y: Math.abs(touchOne.pageY - touchTwo.pageY),
    };

    const updates = {};
    const multipliers = {
      time: -1,
      x: -1,
      y: 1,
    };
    itemIds.forEach(itemId => {
      updates[itemId] = {};
      ['x', 'y', 'time']
        .filter(axis => zoomAxes[axis] && this.lastDeltas[axis])
        .forEach(axis => {
          const subDomain = (subDomainsByItemId[itemId] || {})[axis];
          const subDomainRange = subDomain[1] - subDomain[0];
          // TODO: Find the center of the touches and then place that on the
          // rect so that we can figure out where to zoom relative to.
          const percentFromEnd = 0.5;

          const zoomFactor =
            multipliers[axis] *
            ((deltas[axis] - this.lastDeltas[axis]) / distances[axis]);

          // Figure out the value on the scale where the mouse is so that the
          // new subdomain does not shift.
          const valueAtCenter = subDomain[0] + subDomainRange * percentFromEnd;

          // How big the next subdomain is going to be
          const newSpan = subDomainRange * (1 + zoomFactor);

          // Finally, place this new span into the subdomain, centered about the
          // mouse, and correctly (proportionately) split above & below so that
          // theaxis is stable.
          updates[itemId][axis] = [
            valueAtCenter - newSpan * percentFromEnd,
            valueAtCenter + newSpan * (1 - percentFromEnd),
          ];
        });
    });
    this.lastDeltas = { ...deltas };
    return updates;
  };

  syncZoomingState = () => {
    const { zoomAxes } = this.props;
    if (Object.keys(zoomAxes).find(axis => zoomAxes[axis])) {
      this.rectSelection.on('touchend', this.onTouchEnd, true);
      this.rectSelection.on('touchmove', this.onTouchMove, true);
      this.rectSelection.on('touchstart', this.onTouchStart, true);
      this.rectSelection.call(this.zoom.on('zoom', this.zoomed));
      this.rectSelection.on('dblclick.zoom', null);
    } else {
      this.rectSelection.on('.zoom', null);
    }
  };

  zoomed = () => {
    const { zoomAxes, itemIds, width, height } = this.props;
    const {
      event: { sourceEvent },
    } = d3;
    // FIXME: Once we have separate X axis zooming, we can remove this whole
    // special case.
    if (zoomAxes.time && itemIds.length > 0) {
      // TODO: Support separate X axis zooming
      const firstItemId = itemIds[0];
      const { time: timeSubDomain } =
        this.props.subDomainsByItemId[firstItemId] || {};
      const timeSubDomainRange = timeSubDomain[1] - timeSubDomain[0];
      let newSubDomain = null;
      if (sourceEvent.deltaY) {
        // This is a zoom event.
        const { deltaMode, deltaY, offsetX } = sourceEvent;

        // This was borrowed from d3-zoom.
        const zoomFactor = (deltaY * (deltaMode ? 120 : 1)) / 500;
        const percentFromLeft = offsetX / width;

        // Figure out the value on the scale where the mouse is so that the new
        // subdomain does not shift.
        const valueAtMouse =
          timeSubDomain[0] + timeSubDomainRange * percentFromLeft;

        // How big the next subdomain is going to be
        const newSpan = timeSubDomainRange * (1 + zoomFactor);

        // Finally, place this new span into the subdomain, centered about the
        // mouse, and correctly (proportionately) split above & below so that the
        // axis is stable.
        newSubDomain = [
          valueAtMouse - newSpan * percentFromLeft,
          valueAtMouse + newSpan * (1 - percentFromLeft),
        ];
      } else if (sourceEvent.movementX) {
        // This is a drag event.
        const percentMovement =
          timeSubDomainRange * (-sourceEvent.movementX / width);
        newSubDomain = timeSubDomain.map(bound => bound + percentMovement);
      }
      if (newSubDomain) {
        this.props.updateDomains(
          itemIds.reduce(
            (changes, itemId) => ({
              ...changes,
              [itemId]: { time: newSubDomain },
            }),
            {}
          )
        );
      }
    }

    const distances = {
      x: width,
      y: height,
    };

    const movements = {
      x: -sourceEvent.movementX,
      y: sourceEvent.movementY,
    };

    const percents = {
      x: sourceEvent.offsetX / width,
      // Invert the event coordinates for sanity, since they're measured from
      // the top-left, but we want to go from the bottom-left.
      y: (height - sourceEvent.offsetY) / height,
    };

    const updates = {};
    itemIds.forEach(itemId => {
      updates[itemId] = {};
      ['x', 'y'].filter(axis => zoomAxes[axis]).forEach(axis => {
        const subDomain = (this.props.subDomainsByItemId[itemId] || {})[axis];
        const subDomainRange = subDomain[1] - subDomain[0];
        let newSubDomain = null;
        if (sourceEvent.deltaY) {
          // This is a zoom event.
          const { deltaMode, deltaY } = sourceEvent;
          const percentFromEnd = percents[axis];

          // This was borrowed from d3-zoom.
          const zoomFactor = (deltaY * (deltaMode ? 120 : 1)) / 500;

          // Figure out the value on the scale where the mouse is so that the
          // new subdomain does not shift.
          const valueAtMouse = subDomain[0] + subDomainRange * percentFromEnd;

          // How big the next subdomain is going to be
          const newSpan = subDomainRange * (1 + zoomFactor);

          // Finally, place this new span into the subdomain, centered about the
          // mouse, and correctly (proportionately) split above & below so that
          // theaxis is stable.
          newSubDomain = [
            valueAtMouse - newSpan * percentFromEnd,
            valueAtMouse + newSpan * (1 - percentFromEnd),
          ];
        } else if (movements[axis]) {
          // This is a drag event.
          const percentMovement =
            subDomainRange * (movements[axis] / distances[axis]);
          newSubDomain = subDomain.map(bound => bound + percentMovement);
        }
        if (newSubDomain) {
          updates[itemId][axis] = newSubDomain;
        }
      });
    });
    this.props.updateDomains(updates);
  };

  render() {
    const {
      width,
      height,
      onClick,
      onMouseMove,
      onMouseOut,
      onMouseDown,
      onMouseUp,
      onDoubleClick,
    } = this.props;
    return (
      <rect
        ref={ref => {
          this.zoomNode = ref;
        }}
        pointerEvents="all"
        fill="none"
        width={width}
        height={height}
        onClick={onClick}
        onMouseMove={onMouseMove}
        onBlur={onMouseMove}
        onMouseOut={onMouseOut}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onDoubleClick={onDoubleClick}
      />
    );
  }
}

ZoomRect.propTypes = propTypes;
ZoomRect.defaultProps = defaultProps;

export default props => (
  <ScalerContext.Consumer>
    {({
      xScalerFactory,
      domainsByItemId,
      subDomainsByItemId,
      updateDomains,
    }) => (
      <ZoomRect
        {...props}
        domainsByItemId={domainsByItemId}
        subDomainsByItemId={subDomainsByItemId}
        xScalerFactory={xScalerFactory}
        updateDomains={updateDomains}
      />
    )}
  </ScalerContext.Consumer>
);
