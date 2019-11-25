import { AxisPlacement } from 'components/AxisPlacement';
import { TickFormatter } from 'utils/Axes';
import { SizeMeProps } from 'react-sizeme';
import { Collection, Series } from 'external';

export type ScatterplotProps = SizeMeProps & {
  // visual options
  zoomable?: boolean;

  xAxisFormatter?: TickFormatter;
  xAxisPlacement?: AxisPlacement;
  xAxisTicks?: number;
  xAxisHeight?: number;

  yAxisFormatter?: TickFormatter;
  yAxisPlacement?: AxisPlacement;
  yAxisTicks?: number;
  yAxisWidth?: number;

  // deprecated data props
  collections?: Collection[];
  series?: Series[];

  // event based function props
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;

  // The following props are all supplied internally (eg, by React).
  children?: React.ReactNode;
};
