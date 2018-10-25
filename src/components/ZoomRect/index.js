import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import isEqual from 'lodash.isequal';
import ScalerContext from '../../context/Scaler';
import GriffPropTypes from '../../utils/proptypes';
import Axes from '../../utils/Axes';

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
  /**
   * This is a callback which will be called whenever there is a touchmove event
   * with only one touch. This is used to keep the rule in the same x-position
   * (in terms of pixels) on the screen while pans happen by dragging.
   *
   * {@code (offsetX, offsetY) => void}
   */
  // FIXME: Remove this bit and move the business logic to the apps.
  onTouchDrag: PropTypes.func,

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
  onTouchDrag: null,
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

  onMouseMove = e => {
    this.firstTouch = this.getOffset(e.nativeEvent);
    if (this.props.onMouseMove) {
      this.props.onMouseMove(e);
    }
  };

  onTouchStart = () => {
    const {
      event: { touches },
    } = d3;
    if (touches.length === 1) {
      const [touch] = touches;
      const { pageX: x, pageY: y } = touch;
      this.lastTouch = {
        [Axes.time]: x,
        [Axes.x]: x,
        [Axes.y]: y,
      };
    } else if (touches.length === 2) {
      const [touchOne, touchTwo] = touches;
      const { x: touchOneX, y: touchOneY } = this.getOffset(touchOne);
      const { x: touchTwoX, y: touchTwoY } = this.getOffset(touchTwo);
      this.lastDeltas = {
        [Axes.time]: Math.abs(touchOneX - touchTwoX),
        [Axes.x]: Math.abs(touchOneX - touchTwoX),
        [Axes.y]: Math.abs(touchOneY - touchTwoY),
      };
    }
  };

  // TODO: A lot of this is duplicated with `zoomed` -- maybe they can be
  // consolidated?
  onTouchMove = () => {
    const { width, height } = this.props;

    const totalDistances = {
      [Axes.time]: width,
      [Axes.x]: width,
      // height needs to be negated because pixels are measured with 0 at the
      // top, but the axis is rendered with the 0 value at the bottom.
      [Axes.y]: -height,
    };

    const {
      event: { touches },
    } = d3;
    let updates = null;
    if (touches.length === 1) {
      // If there was only one touch, then it was a drag event.
      updates = this.performTouchDrag(touches, totalDistances);

      if (this.props.onTouchDrag) {
        const { x: touchX, y: touchY } = this.firstTouch;
        this.props.onTouchDrag(touchX, touchY);
      }
    } else if (touches.length === 2) {
      // If there were two, then it is a zoom event.
      updates = this.performTouchZoom(touches, totalDistances);
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
        [Axes.time]: x,
        [Axes.x]: x,
        [Axes.y]: y,
      };
    } else {
      // We don't support more complicated gestures, so any more than 2 fingers
      // touching the screen are ignored.
    }
  };

  getOffset = ({ pageX, pageY }) => {
    const {
      x: boundingX,
      y: boundingY,
    } = this.zoomNode.getBoundingClientRect();
    return {
      x: pageX - boundingX,
      y: pageY - boundingY,
    };
  };

  performTouchDrag = (touches, totalDistances) => {
    const { itemIds, subDomainsByItemId, zoomAxes } = this.props;
    const [touch] = touches;
    const newTouchPosition = {
      [Axes.time]: touch.pageX,
      [Axes.x]: touch.pageX,
      [Axes.y]: touch.pageY,
    };
    const updates = {};
    itemIds.forEach(itemId => {
      updates[itemId] = {};
      Axes.ALL.filter(axis => zoomAxes[axis]).forEach(axis => {
        const subDomain = (subDomainsByItemId[itemId] || {})[axis];
        const subDomainRange = subDomain[1] - subDomain[0];
        let newSubDomain = null;
        const percentMovement =
          subDomainRange *
          ((this.lastTouch[axis] - newTouchPosition[axis]) /
            totalDistances[axis]);
        newSubDomain = subDomain.map(bound => bound + percentMovement);
        if (newSubDomain) {
          updates[itemId][axis] = newSubDomain;
        }
      });
    });
    this.lastTouch = { ...newTouchPosition };
    return updates;
  };

  performTouchZoom = (touches, totalDistances) => {
    const { itemIds, subDomainsByItemId, zoomAxes, width, height } = this.props;
    const [touchOne, touchTwo] = touches;
    const { x: touchOneX, y: touchOneY } = this.getOffset(touchOne);
    const { x: touchTwoX, y: touchTwoY } = this.getOffset(touchTwo);
    const centers = {
      [Axes.time]: (touchOneX + touchTwoX) / 2,
      [Axes.x]: (touchOneX + touchTwoX) / 2,
      [Axes.y]: (touchOneY + touchTwoY) / 2,
    };
    const deltas = {
      [Axes.time]: Math.abs(touchOneX - touchTwoX),
      [Axes.x]: Math.abs(touchOneX - touchTwoX),
      [Axes.y]: Math.abs(touchOneY - touchTwoY),
    };
    // These are used to multiply the zoomFactor in each direction. These need
    // to be treated separately because height is measured inverted from width.
    // That is, a point lower on the screen (touching a lower axis value) has a
    // higher Y pixel value than a point above it (one which is touching a
    // higher axis value). Conversely, points along the time and x axes have
    // x values which match the direction of the pixel values.
    // The inversion (or lack thereof) needs to happen because when the
    // distance between the fingers decreases, we want the subdomain to increase
    // so the value needs to be inverted. (Phew!)
    const multipliers = {
      [Axes.time]: -1,
      [Axes.x]: -1,
      [Axes.y]: 1,
    };
    // This is almost the same as the `totalDistances` object, except the height
    // is un-inverted for y axis.
    const measurements = {
      [Axes.time]: width,
      [Axes.x]: width,
      [Axes.y]: height,
    };

    const updates = {};
    itemIds.forEach(itemId => {
      updates[itemId] = {};
      Axes.ALL.filter(axis => zoomAxes[axis] && this.lastDeltas[axis]).forEach(
        axis => {
          const subDomain = (subDomainsByItemId[itemId] || {})[axis];
          const subDomainRange = subDomain[1] - subDomain[0];
          const percentFromEnd = centers[axis] / measurements[axis];

          const zoomFactor =
            multipliers[axis] *
            ((deltas[axis] - this.lastDeltas[axis]) / totalDistances[axis]);

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
        }
      );
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

  /**
   * {@link #zoomed()} is called when D3 is handling the zoom -- such as with
   * a pointing device. However, {@link #onTouchMove()} is used to handle events
   * with touch sources (such as fingers on a touchscreen).
   */
  zoomed = () => {
    const { zoomAxes, itemIds, width, height } = this.props;
    const {
      event: { sourceEvent },
    } = d3;

    const totalDistances = {
      [Axes.time]: width,
      [Axes.x]: width,
      [Axes.y]: height,
    };

    const movements = {
      [Axes.time]: -sourceEvent.movementX,
      [Axes.x]: -sourceEvent.movementX,
      [Axes.y]: sourceEvent.movementY,
    };

    const percents = {
      [Axes.time]: sourceEvent.offsetX / width,
      [Axes.x]: sourceEvent.offsetX / width,
      // Invert the event coordinates for sanity, since they're measured from
      // the top-left, but we want to go from the bottom-left.
      [Axes.y]: (height - sourceEvent.offsetY) / height,
    };

    const updates = {};
    itemIds.forEach(itemId => {
      updates[itemId] = {};
      Axes.ALL.filter(axis => zoomAxes[axis]).forEach(axis => {
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
            subDomainRange * (movements[axis] / totalDistances[axis]);
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
        onMouseMove={this.onMouseMove}
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
