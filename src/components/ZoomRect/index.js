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

  syncZoomingState = () => {
    const { zoomAxes } = this.props;
    if (Object.keys(zoomAxes).find(axis => zoomAxes[axis])) {
      this.rectSelection.call(this.zoom.on('zoom', this.zoomed));
      this.rectSelection.on('dblclick.zoom', null);
    } else {
      this.rectSelection.on('.zoom', null);
    }
  };

  zoomed = () => {
    const { zoomAxes, itemIds, width, height } = this.props;
    const {
      event: { sourceEvent, transform },
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
      } else if (sourceEvent.type === 'touchmove') {
        // This is a drag event from touch.
        const percentMovement = timeSubDomainRange * (-transform.x / width);
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
          // () => this.selection.property('__zoom', d3.zoomIdentity)
        );
      }
      // if (onZoomXAxis) {
      //   onZoomXAxis({ timeSubDomain: newDomain, transformation: t });
      // }
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

          // Figure out the value on the scale where the mouse is so that the new
          // subdomain does not shift.
          const valueAtMouse = subDomain[0] + subDomainRange * percentFromEnd;

          // How big the next subdomain is going to be
          const newSpan = subDomainRange * (1 + zoomFactor);

          // Finally, place this new span into the subdomain, centered about the
          // mouse, and correctly (proportionately) split above & below so that the
          // axis is stable.
          newSubDomain = [
            valueAtMouse - newSpan * percentFromEnd,
            valueAtMouse + newSpan * (1 - percentFromEnd),
          ];
        } else if (movements[axis]) {
          // This is a drag event.
          const percentMovement =
            subDomainRange * (movements[axis] / distances[axis]);
          newSubDomain = subDomain.map(bound => bound + percentMovement);
        } else if (sourceEvent.type === 'touchmove') {
          // This is a drag event from touch.
          const percentMovement = subDomainRange * (transform.y / height);
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
