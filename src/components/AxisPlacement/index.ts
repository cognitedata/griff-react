/** Control how an axis is placed on the screen. */
// TODO: Consider rewriting this as an enum.
export interface AxisPlacement {
  id: number;
  name: string;
  toString: () => string;
}

const AXIS_PLACEMENTS: {
  UNSPECIFIED: AxisPlacement;
  RIGHT: AxisPlacement;
  LEFT: AxisPlacement;
  BOTH: AxisPlacement;
  BOTTOM: AxisPlacement;
  TOP: AxisPlacement;
} = {
  UNSPECIFIED: { id: 0, name: 'UNSPECIFIED', toString: () => 'UNSPECIFIED' },
  RIGHT: { id: 1, name: 'RIGHT', toString: () => 'RIGHT' },
  LEFT: { id: 2, name: 'LEFT', toString: () => 'LEFT' },
  BOTH: { id: 3, name: 'BOTH', toString: () => 'BOTH' },
  BOTTOM: { id: 4, name: 'BOTTOM', toString: () => 'BOTTOM' },
  TOP: { id: 5, name: 'TOP', toString: () => 'TOP' },
};

export default AXIS_PLACEMENTS;
