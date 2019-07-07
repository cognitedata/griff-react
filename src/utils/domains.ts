import { placeholder } from './placeholder';
import { Domain, Datapoint, DomainPriority } from '../external';
import { ScaledSeries, DataDomains } from '../internal';

export const isEqual = (a: Domain, b: Domain): boolean => {
  if (a === b) {
    return true;
  }
  if (!!a !== !!b) {
    return false;
  }
  return a[0] === b[0] && a[1] === b[1];
};

export const newDomain = (
  start: number,
  end: number,
  priority: DomainPriority
): Domain => {
  const domain: [number, number] & { priority?: DomainPriority } = [start, end];
  domain.priority = priority;
  domain.toString = () => `[${start}, ${end}] (priority: ${priority})`;
  return domain as Domain;
};

export const copyDomain = (
  domain: Domain,
  priority?: DomainPriority
): Domain => {
  return newDomain(domain[0], domain[1], priority || domain.priority);
};

export const copyDataDomains = ({ time, x, y }: DataDomains): DataDomains => ({
  time: copyDomain(time),
  x: copyDomain(x),
  y: copyDomain(y),
});

export const highestPriorityDomain = (
  ...domains: Array<Domain | undefined>
): Domain | undefined => {
  const filtered: Domain[] = domains.filter(
    domain => domain !== undefined
  ) as Domain[];
  if (filtered.length === 0) {
    return undefined;
  }
  if (filtered.length === 1) {
    return filtered[0];
  }

  // Note that sort() updates the array (but also returns it) so filtered is
  // also sorted by this. However, the returned variable is renamed in the
  // interest of readability.
  const sorted = filtered.sort((a: Domain, b: Domain) => {
    return b.priority - a.priority;
  });
  return sorted[0];
};

const withPadding = (extent: [number, number]): Domain => {
  const diff = extent[1] - extent[0];
  if (Math.abs(diff) < 1e-3) {
    if (extent[0] === 0) {
      // If 0 is the only value present in the series, hard code domain.
      return newDomain(-0.25, 0.25, DomainPriority.CALCULATED);
    }
    const domain = [(1 / 2) * extent[0], (3 / 2) * extent[0]];
    if (domain[1] < domain[0]) {
      return newDomain(domain[1], domain[0], DomainPriority.CALCULATED);
    }
    // @ts-ignore - this is valid -- why are you complaining?
    return domain;
  }
  return newDomain(
    extent[0] - diff * 0.025,
    extent[1] + diff * 0.025,
    DomainPriority.CALCULATED
  );
};

export const calculated = (domain: Domain): Domain => {
  domain.priority = DomainPriority.CALCULATED;
  return domain;
};

export const calculateDomains = (
  s: ScaledSeries & { data: Datapoint[] }
): { time: Domain; x: Domain; y: Domain } => {
  const {
    data,
    timeAccessor,
    xAccessor,
    x0Accessor,
    x1Accessor,
    yAccessor,
    y0Accessor,
    y1Accessor,
  } = s;

  if (!data || data.length === 0) {
    // There isn't any data -- return some default domains.
    return {
      time: placeholder(0, Date.now()),
      x: placeholder(-0.25, 0.25),
      y: placeholder(-0.25, 0.25),
    };
  }

  const timeExtent: [number, number] = [
    Number.MAX_SAFE_INTEGER,
    Number.MIN_SAFE_INTEGER,
  ];
  const xExtent: [number, number] = [
    Number.MAX_SAFE_INTEGER,
    Number.MIN_SAFE_INTEGER,
  ];
  const yExtent: [number, number] = [
    Number.MAX_SAFE_INTEGER,
    Number.MIN_SAFE_INTEGER,
  ];
  for (let i = 0; i < data.length; i += 1) {
    const point = data[i];
    const time = timeAccessor(point);
    timeExtent[0] = Math.min(timeExtent[0], time);
    timeExtent[1] = Math.max(timeExtent[1], time);

    const x = xAccessor(point);
    const x0 = x0Accessor ? x0Accessor(point) : x;
    const x1 = x1Accessor ? x1Accessor(point) : x;
    xExtent[0] = Math.min(xExtent[0], x, x0);
    xExtent[1] = Math.max(xExtent[1], x, x1);

    const y = yAccessor(point);
    const y0 = y0Accessor ? y0Accessor(point) : y;
    const y1 = y1Accessor ? y1Accessor(point) : y;
    yExtent[0] = Math.min(yExtent[0], y, y0);
    yExtent[1] = Math.max(yExtent[1], y, y1);
  }
  return {
    time: calculated(withPadding(timeExtent)),
    x: calculated(withPadding(xExtent)),
    y: calculated(withPadding(yExtent)),
  };
};

export const PLACEHOLDER_DOMAIN = newDomain(
  Number.MIN_SAFE_INTEGER,
  Number.MAX_SAFE_INTEGER,
  DomainPriority.PLACEHOLDER
);

export const PLACEHOLDER_SUBDOMAIN = newDomain(
  0,
  0,
  DomainPriority.PLACEHOLDER
);
