import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import isEqual from 'lodash.isequal';
import ScalerContext from '../../context/Scaler';
import { ZoomMode } from '../InteractionLayer';

const propTypes = {
  itemIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired
  ).isRequired,
  zoomAxes: PropTypes.shape({
    x: PropTypes.bool,
    y: PropTypes.bool,
    time: PropTypes.bool,
  }),
};

const defaultProps = {
  zoomAxes: {},
};

class ZoomRect extends React.Component {
  componentDidMount() {
    const { width, height, xScalerFactory } = this.props;
    this.zoom = d3
      .zoom()
      .translateExtent([[0, 0], [width, height]])
      .extent([[0, 0], [width, height]]);
    this.rectSelection = d3.select(this.zoomNode);
    this.syncZoomingState();

    if (this.rectSelection.property('__zoom')) {
      const { xSubDomain, xDomain } = this.props;
      // if xSubDomain differs from xDomain on componentDidMount step that
      // means it has been specified by a user and we need to update internals
      if (!isEqual(xSubDomain, xDomain)) {
        const scale = xScalerFactory(xDomain, width);
        const selection = xSubDomain.map(scale);
        const transform = d3.zoomIdentity
          .scale(width / (selection[1] - selection[0]))
          .translate(-selection[0], 0);
        this.rectSelection.property('__zoom', transform);
      }
    }
  }

  syncZoomingState = () => {
    const { onAreaDefined, onDoubleClick } = this.props;
    this.rectSelection.call(this.zoom.on('zoom', this.zoomed));
    if (onDoubleClick) {
      this.rectSelection.on('dblclick.zoom', null);
    }
  };

  zoomed = () => {
    const { zoomAxes, itemIds, width, height } = this.props;
    const {
      event: { sourceEvent, transform },
    } = d3;
    if (zoomAxes.x) {
      // TODO: Support separate X axis zooming
      const firstItemId = itemIds[0];
      const { x: xSubDomain } =
        this.props.subDomainsByItemId[firstItemId] || {};
      const xSubDomainRange = xSubDomain[1] - xSubDomain[0];
      let newSubDomain = null;
      if (sourceEvent.deltaY) {
        // This is a zoom event.
        const { deltaMode, deltaY, offsetX } = sourceEvent;

        // This was borrowed from d3-zoom.
        const zoomFactor = (deltaY * (deltaMode ? 120 : 1)) / 500;
        const percentFromLeft = offsetX / width;

        // Figure out the value on the scale where the mouse is so that the new
        // subdomain does not shift.
        const valueAtMouse = xSubDomain[0] + xSubDomainRange * percentFromLeft;

        // How big the next subdomain is going to be
        const newSpan = xSubDomainRange * (1 + zoomFactor);

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
          xSubDomainRange * (-sourceEvent.movementX / width);
        newSubDomain = xSubDomain.map(bound => bound + percentMovement);
      } else if (sourceEvent.type === 'touchmove') {
        // This is a drag event from touch.
        const percentMovement = xSubDomainRange * (-transform.x / width);
        newSubDomain = xSubDomain.map(bound => bound + percentMovement);
      }
      if (newSubDomain) {
        this.props.updateDomains(
          itemIds.reduce(
            (changes, itemId) => ({
              ...changes,
              [itemId]: { x: newSubDomain },
            }),
            {}
          )
          // () => this.selection.property('__zoom', d3.zoomIdentity)
        );
      }
      // if (onZoomXAxis) {
      //   onZoomXAxis({ xSubDomain: newDomain, transformation: t });
      // }
    }
    if (zoomAxes.y || zoomAxes.time) {
      const updates = itemIds.reduce((changes, itemId) => {
        const { y: ySubDomain } = this.props.subDomainsByItemId[itemId] || {};
        const ySubDomainRange = ySubDomain[1] - ySubDomain[0];
        let newSubDomain = null;
        if (sourceEvent.deltaY) {
          // This is a zoom event.
          const { deltaMode, deltaY, offsetY } = sourceEvent;

          // This was borrowed from d3-zoom.
          const zoomFactor = (deltaY * (deltaMode ? 120 : 1)) / 500;

          // Invert the event coordinates for sanity, since they're measured from
          // the top-left, but we want to go from the bottom-left.
          const percentFromBottom = (height - offsetY) / height;

          // Figure out the value on the scale where the mouse is so that the new
          // subdomain does not shift.
          const valueAtMouse =
            ySubDomain[0] + ySubDomainRange * percentFromBottom;

          // How big the next subdomain is going to be
          const newSpan = ySubDomainRange * (1 + zoomFactor);

          // Finally, place this new span into the subdomain, centered about the
          // mouse, and correctly (proportionately) split above & below so that the
          // axis is stable.
          newSubDomain = [
            valueAtMouse - newSpan * percentFromBottom,
            valueAtMouse + newSpan * (1 - percentFromBottom),
          ];
        } else if (sourceEvent.movementY) {
          // This is a drag event.
          const percentMovement =
            ySubDomainRange * (sourceEvent.movementY / height);
          newSubDomain = ySubDomain.map(bound => bound + percentMovement);
        } else if (sourceEvent.type === 'touchmove') {
          // This is a drag event from touch.
          const percentMovement = ySubDomainRange * (transform.y / height);
          newSubDomain = ySubDomain.map(bound => bound + percentMovement);
        }
        if (newSubDomain) {
          return {
            ...changes,
            [itemId]: Object.keys(zoomAxes).reduce(
              (domains, axis) => ({ ...domains, [axis]: newSubDomain }),
              {}
            ),
          };
        }
        return changes;
      }, {});
      this.props.updateDomains(updates);
    }
  };

  render() {
    return (
      <rect
        ref={ref => {
          this.zoomNode = ref;
        }}
        {...this.props}
      />
    );
  }
}

ZoomRect.propTypes = propTypes;
ZoomRect.defaultProps = defaultProps;

export default props => (
  <ScalerContext.Consumer>
    {({
      updateYTransformation,
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
        updateYTransformation={updateYTransformation}
        updateDomains={updateDomains}
      />
    )}
  </ScalerContext.Consumer>
);
