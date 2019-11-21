import { ValueFunc, LoaderFunc } from './types';

const POINT_COUNT_DEFAULT = 250;

export const createTrigValueFunc = (
  trigFn: (n: number) => number,
  oscillations: number = 1
): ValueFunc => (i, n) => trigFn(2 * Math.PI * (i / n) * oscillations);

type CreateStaticLoaderProps = {
  pointCount?: number;
  valueFunc?: ValueFunc;
};

export const createStaticLoader = ({
  pointCount = POINT_COUNT_DEFAULT,
  valueFunc = createTrigValueFunc(Math.sin, 1),
}: CreateStaticLoaderProps = {}): LoaderFunc => ({ timeDomain }) => {
  const diff = timeDomain[1] - timeDomain[0];
  return {
    data: Array(pointCount)
      .fill(null)
      .map((_, i) => {
        return {
          value: valueFunc(i, pointCount),
          timestamp: timeDomain[0] + diff * (i / pointCount),
        };
      }),
  };
};
